import {
  JobData,
  Job,
  JobQueueStrategyJobOptions,
  JobProcess,
} from '../../job-queue';
import { InjectableStrategy } from '../../common';

export interface JobQueueStrategy extends InjectableStrategy {
  add<T extends JobData<T> = object>(
    job: Job<T>,
    jobOptions?: JobQueueStrategyJobOptions<T>
  ): Promise<Job<T>>;

  start<T extends JobData<T> = object>(
    queueName: string,
    process: JobProcess<T>
  ): Promise<void>;

  stop<T extends JobData<T> = object>(
    queueName: string,
    process: JobProcess<T>
  ): Promise<void>;
}
