import { JobQueueStrategy } from '../config';
import { Job } from './job';
import { SubscribableJob } from './subscribable-job';
import { JobData, JobOptions, QueueOptions } from './types';

export class JobQueue<T extends JobData<T> = object> {
  protected running = false;

  public get started(): boolean {
    return this.running;
  }

  public get name(): string {
    return this.options.name;
  }

  constructor(
    private options: QueueOptions<T>,
    private jobQueueStrategy: JobQueueStrategy
  ) {}

  public async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    await this.jobQueueStrategy.start<T>(
      this.options.name,
      this.options.process
    );
  }

  public async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.running = false;

    return this.jobQueueStrategy.stop(this.options.name, this.options.process);
  }

  public async add(
    data: T,
    options?: JobOptions<T>
  ): Promise<SubscribableJob<T>> {
    const job = new Job<T>({
      data,
      queueName: this.options.name,
      retries: options?.retries ?? 0,
    });

    // const isBuffered = await this.jobBufferService.add(job);
    // if (!isBuffered) {
    const addedJob = await this.jobQueueStrategy.add(job, options);

    return new SubscribableJob(addedJob, this.jobQueueStrategy);
    // } else {
    //   const bufferedJob = new Job({
    //     ...job,
    //     data: job.data,
    //     id: 'buffered',
    //   });
    //   return new SubscribableJob(bufferedJob, this.jobQueueStrategy);
    // }
  }
}
