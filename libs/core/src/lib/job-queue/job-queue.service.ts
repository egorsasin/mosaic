import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { ConfigService, JobQueueStrategy, Logger } from '../config';
import { JobQueue } from './job-queue';
import { loggerCtx } from './constants';
import { JobData, QueueOptions } from './types';
import { Job } from './job';

@Injectable()
export class JobQueueService implements OnModuleDestroy {
  private queues: Array<JobQueue<unknown>> = [];
  private hasStarted = false;

  private get jobQueueStrategy(): JobQueueStrategy {
    return this.configService.jobQueueOptions.jobQueueStrategy;
  }

  constructor(private configService: ConfigService) {}

  public async start(): Promise<void> {
    this.hasStarted = true;

    for (const queue of this.queues) {
      if (!queue.started && this.shouldStartQueue(queue.name)) {
        Logger.info(`Starting queue: ${queue.name}`, loggerCtx);

        await queue.start();
      }
    }
  }

  public async createQueue<Data extends JobData<Data>>(
    options: QueueOptions<Data>
  ): Promise<JobQueue<Data>> {
    if (this.configService.jobQueueOptions.prefix) {
      options = {
        ...options,
        name: `${this.configService.jobQueueOptions.prefix}${options.name}`,
      };
    }

    options = {
      ...options,
      process: this.createWrappedProcessFn(options.process),
    };

    const queue = new JobQueue(
      options,
      this.jobQueueStrategy
      //this.jobBufferService
    );

    if (this.hasStarted && this.shouldStartQueue(queue.name)) {
      await queue.start();
    }

    this.queues.push(queue);
    return queue;
  }

  public onModuleDestroy(): Promise<void[]> {
    this.hasStarted = false;

    return Promise.all(this.queues.map((q) => q.stop()));
  }

  private shouldStartQueue(queueName: string): boolean {
    const { activeQueues } = this.configService.jobQueueOptions;

    return activeQueues.length > 0 ? !activeQueues.includes(queueName) : true;
  }

  private createWrappedProcessFn<Data extends JobData<Data>>(
    processFn: (job: Job<Data>) => Promise<Data>
  ): (job: Job<Data>) => Promise<Data> {
    // const { errorHandlers } = this.configService.systemOptions;

    return async (job: Job<Data>) => {
      // eslint-disable-next-line no-useless-catch
      try {
        return await processFn(job);
      } catch (e) {
        // TODO
        // for (const handler of errorHandlers) {
        //   if (e instanceof Error) {
        //     void handler.handleWorkerError(e, { job });
        //   }
        // }
        throw e;
      }
    };
  }
}
