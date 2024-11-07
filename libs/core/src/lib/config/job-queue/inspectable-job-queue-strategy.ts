import { Job } from '../../job-queue';

import { JobQueueStrategy } from './job-queue-strategy';

export interface InspectableJobQueueStrategy extends JobQueueStrategy {
  findOne(id: number | string): Promise<Job | undefined>;
  //findMany(options?: JobListOptions): Promise<PaginatedList<Job>>;
  //findManyById(ids: ID[]): Promise<Job[]>;
  // removeSettledJobs(queueNames?: string[], olderThan?: Date): Promise<number>;
  cancelJob(jobId: number): Promise<Job | undefined>;
}

export function isInspectableJobQueueStrategy(
  strategy: JobQueueStrategy
): strategy is InspectableJobQueueStrategy {
  return (
    (strategy as InspectableJobQueueStrategy).findOne !== undefined // &&
    //(strategy as InspectableJobQueueStrategy).findMany !== undefined &&
    //(strategy as InspectableJobQueueStrategy).findManyById !== undefined &&
    //(strategy as InspectableJobQueueStrategy).removeSettledJobs !== undefined
  );
}
