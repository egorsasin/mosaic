import {
  filter,
  firstValueFrom,
  from,
  interval,
  race,
  Subject,
  Subscription,
  switchMap,
  take,
  throttleTime,
} from 'rxjs';

import { Logger } from '../../config';
import { Job } from '../job';
import { QueueNameProcessStorage } from '../queue-name-process-storage';
import { JobData, JobProcess } from '../types';
import { InjectableJobQueueStrategy } from './injectable-job-queue-strategy';
import { JobState } from '../../common';

export type BackoffStrategy = (
  queueName: string,
  attemptsMade: number,
  job: Job
) => number;

export interface PollingJobQueueStrategyConfig {
  concurrency: number;
  pollInterval?: number | ((queueName: string) => number);
  setRetries?: (queueName: string, job: Job) => number;
  backoffStrategy?: BackoffStrategy;
  gracefulShutdownTimeout?: number;
}

const STOP_SIGNAL = Symbol('STOP_SIGNAL');

class ActiveQueue<T extends JobData<T> = object> {
  private running = false;
  private activeJobs: Job<T>[] = [];
  private timer: NodeJS.Timeout;
  private readonly pollInterval: number;
  private queueStopped$ = new Subject<typeof STOP_SIGNAL>();
  private subscription: Subscription;
  private errorNotifier$ = new Subject<[string, string]>();

  constructor(
    private readonly queueName: string,
    private readonly process: JobProcess<T>,
    private readonly jobQueueStrategy: PollingJobQueueStrategy
  ) {
    this.pollInterval =
      typeof this.jobQueueStrategy.pollInterval === 'function'
        ? this.jobQueueStrategy.pollInterval(queueName)
        : this.jobQueueStrategy.pollInterval;
  }

  public start() {
    Logger.debug(`Starting JobQueue "${this.queueName}"`);

    this.subscription = this.errorNotifier$
      .pipe(throttleTime(3000))
      .subscribe(([message, stack]) => {
        Logger.error(message);
        Logger.debug(stack);
      });

    this.running = true;

    const runNextJobs = async () => {
      try {
        const runningJobsCount: number = this.activeJobs.length;

        for (
          let i = runningJobsCount;
          i < this.jobQueueStrategy.concurrency;
          i++
        ) {
          const nextJob: Job<T> = await this.jobQueueStrategy.next(
            this.queueName
          );

          if (nextJob) {
            this.activeJobs.push(nextJob);
            await this.jobQueueStrategy.update(nextJob);

            const onProgress = (job: Job) => this.jobQueueStrategy.update(job);

            nextJob.on('progress', onProgress);

            const cancellationSub = interval(this.pollInterval * 5)
              .pipe(
                switchMap(() => this.jobQueueStrategy.findOne(nextJob.id)),
                filter((job) => job?.state === JobState.CANCELLED),
                take(1)
              )
              .subscribe(() => {
                nextJob.cancel();
              });

            const stopSignal$ = this.queueStopped$.pipe(take(1));

            firstValueFrom(race(from(this.process(nextJob)), stopSignal$))
              .then(
                (result) => {
                  if (result === STOP_SIGNAL) {
                    nextJob.defer();
                  } else if (
                    result instanceof Job &&
                    result.state === JobState.CANCELLED
                  ) {
                    nextJob.cancel();
                  } else {
                    nextJob.complete(result || undefined);
                  }
                },
                (err) => {
                  nextJob.fail(err);
                }
              )
              .finally(() => {
                nextJob.off('progress', onProgress);
                cancellationSub.unsubscribe();

                return this.onFailOrComplete(nextJob);
              })
              .catch((err: never) => {
                Logger.warn(`Error updating job info: ${JSON.stringify(err)}`);
              });
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        this.errorNotifier$.next([
          `Job queue "${
            this.queueName
          }" encountered an error (set log level to Debug for trace): ${JSON.stringify(
            e.message
          )}`,
          e.stack,
        ]);
      }

      if (this.running) {
        this.timer = setTimeout(runNextJobs, this.pollInterval);
      }
    };

    void runNextJobs();
  }

  public async stop(stopActiveQueueTimeout = 20_000): Promise<void> {
    this.running = false;
    clearTimeout(this.timer);
    await this.awaitRunningJobsOrTimeout(stopActiveQueueTimeout);

    Logger.info(`Stopped queue: ${this.queueName}`);

    this.subscription.unsubscribe();

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private awaitRunningJobsOrTimeout(
    stopActiveQueueTimeout = 20_000
  ): Promise<void> {
    const start = +new Date();
    let timeout: ReturnType<typeof setTimeout>;
    return new Promise((resolve) => {
      let lastStatusUpdate = +new Date();
      const pollActiveJobs = () => {
        const now = +new Date();
        const timedOut =
          stopActiveQueueTimeout === undefined
            ? false
            : now - start > stopActiveQueueTimeout;

        if (this.activeJobs.length === 0) {
          clearTimeout(timeout);
          resolve();
          return;
        }

        if (timedOut) {
          Logger.warn(
            `Timed out (${stopActiveQueueTimeout}ms) waiting for ${this.activeJobs.length} active jobs in queue "${this.queueName}" to complete. Forcing stop...`
          );

          this.queueStopped$.next(STOP_SIGNAL);
          clearTimeout(timeout);
          resolve();
          return;
        }

        if (this.activeJobs.length > 0) {
          if (now - lastStatusUpdate > 2000) {
            Logger.info(
              `Stopping queue: ${this.queueName} - waiting for ${this.activeJobs.length} active jobs to complete...`
            );
            lastStatusUpdate = now;
          }
        }

        timeout = setTimeout(pollActiveJobs, 200);
      };
      void pollActiveJobs();
    });
  }

  private async onFailOrComplete(job: Job<T>): Promise<void> {
    await this.jobQueueStrategy.update(job);
    this.removeJobFromActive(job);
  }

  private removeJobFromActive(job: Job<T>): void {
    const index = this.activeJobs.indexOf(job);

    if (index !== -1) {
      this.activeJobs.splice(index, 1);
    }
  }
}

export abstract class PollingJobQueueStrategy extends InjectableJobQueueStrategy {
  protected activeQueues = new QueueNameProcessStorage<ActiveQueue>();

  public pollInterval: number | ((queueName: string) => number);
  public concurrency: number;
  public gracefulShutdownTimeout: number;

  constructor(
    concurrencyOrConfig?: number | PollingJobQueueStrategyConfig,
    maybePollInterval?: number
  ) {
    super();

    this.pollInterval = maybePollInterval || 200;
    this.gracefulShutdownTimeout = 20_000;
    this.concurrency = 1;
  }

  public async start<T extends JobData<T> = object>(
    queueName: string,
    process: JobProcess<T>
  ): Promise<void> {
    if (!this.hasInitialized) {
      this.started.set(queueName, process);
      return;
    }

    if (this.activeQueues.has(queueName, process)) {
      return;
    }

    const active = new ActiveQueue<T>(queueName, process, this);
    active.start();
    this.activeQueues.set(queueName, process, active);
  }

  public async stop<T extends JobData<T> = object>(
    queueName: string,
    process: (job: Job<T>) => Promise<unknown>
  ) {
    const active: ActiveQueue = this.activeQueues.getAndDelete(
      queueName,
      process
    );
    if (!active) {
      return;
    }
    await active.stop(this.gracefulShutdownTimeout);
  }

  public abstract next<Data extends JobData<Data> = object>(
    queueName: string
  ): Promise<Job<Data> | undefined>;

  public abstract update(job: Job): Promise<void>;

  public abstract findOne(id: number | string): Promise<Job | undefined>;
}
