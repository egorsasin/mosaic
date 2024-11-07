import { ProcessContext } from '../../process-context';
import { JobState } from '../../common';
import { JobQueueStrategy, Logger } from '../../config';
import { Job } from '../job';
import { JobConfig, JobData } from '../types';
import {
  BackoffStrategy,
  PollingJobQueueStrategy,
} from './polling-job-queue-strategy';
import { Injector } from '../../api';

type ProcessFunc<Data extends JobData<Data> = object> = (
  job: Job<Data>
) => Promise<unknown>;

export class InMemoryJob<T extends JobData<T> = object> extends Job<T> {
  constructor(job: Job<T>) {
    const id =
      job.id ||
      Math.floor(Math.random() * 1000000000)
        .toString()
        .padEnd(10, '0');

    const config: JobConfig<T> = {
      ...job,
      data: job.data,
      id,
    };

    super(config);
  }
}

export class InMemoryJobQueueStrategy
  extends PollingJobQueueStrategy
  implements JobQueueStrategy
{
  public init(injector: Injector): void {
    super.init(injector);
    this.processContext = injector.get(ProcessContext);
    //this.timer = setTimeout(this.evictSettledJobs, this.evictJobsAfterMs);
  }

  public async add<Data extends JobData<Data> = object>(
    job: Job<Data>
  ): Promise<Job<Data>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (job as any).id =
      job.id ||
      Math.floor(Math.random() * 1000000000)
        .toString()
        .padEnd(10, '0');

    this.jobs.set(job.id, job);

    if (!this.unsettledJobs[job.queueName]) {
      this.unsettledJobs[job.queueName] = [];
    }

    this.unsettledJobs[job.queueName].push({ job, updatedAt: new Date() });

    return job;
  }

  public async next<T extends JobData<T> = object>(
    queueName: string,
    waitingJobs: Job[] = []
  ): Promise<Job<T> | undefined> {
    this.checkProcessContext();

    const nextIndex = this.unsettledJobs[queueName]?.findIndex(
      (item) => !waitingJobs.includes(item.job)
    );

    if (nextIndex === -1) {
      return;
    }

    const next = this.unsettledJobs[queueName]?.splice(nextIndex, 1)[0];

    if (next) {
      const { job, updatedAt } = next;
      if (
        job.state === JobState.RETRYING &&
        typeof this.backOffStrategy === 'function'
      ) {
        const msSinceLastFailure = Date.now() - +updatedAt;
        const backOffDelayMs = this.backOffStrategy(
          queueName,
          job.attempts,
          job
        );

        if (msSinceLastFailure < backOffDelayMs) {
          this.unsettledJobs[queueName]?.push(next);
          return;
        }
      }

      job.start();

      return job as Job<T>;
    }
  }

  protected jobs = new Map<number | string, Job>();
  protected unsettledJobs: Record<string, { job: Job; updatedAt: Date }[]> = {};
  protected started = new Map<string, ProcessFunc<unknown>>();
  protected hasInitialized = false;

  private processContext: ProcessContext;
  private processContextChecked = false;

  public backOffStrategy?: BackoffStrategy;

  public async update(job: Job): Promise<void> {
    if (job.state === JobState.RETRYING || job.state === JobState.PENDING) {
      this.unsettledJobs[job.queueName].unshift({
        job,
        updatedAt: new Date(),
      });
    }

    this.jobs.set(job.id, job);
  }

  public async findOne(id: number | string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  private checkProcessContext() {
    if (!this.processContextChecked) {
      if (this.processContext.isWorker) {
        Logger.error(
          'The InMemoryJobQueueStrategy will not work when running job queues outside the main server process!'
        );
        process.kill(process.pid, 'SIGINT');
      }

      this.processContextChecked = true;
    }
  }
}
