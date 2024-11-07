import { interval, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs/operators';
import ms from 'ms';

import { InternalServerError, notNullOrUndefined, pick } from '@mosaic/common';

import { Job } from './job';
import { JobConfig, JobData } from './types';
import { isInspectableJobQueueStrategy, JobQueueStrategy } from '../config';
import { JobState } from '../common';

/**
 * @description
 * Job update status as returned from the {@link SubscribableJob}'s `update()` method.
 *
 * @docsCategory JobQueue
 * @docsPage types
 */
export type JobUpdate<T extends JobData<T>> = Pick<
  Job<T>,
  'id' | 'state' | 'progress' | 'result' | 'error' | 'data'
>;

export type JobUpdateOptions = {
  pollInterval?: number;
  timeoutMs?: number;
  errorOnFail?: boolean;
};

export class SubscribableJob<T extends JobData<T> = object> extends Job<T> {
  private readonly jobQueueStrategy: JobQueueStrategy;

  constructor(job: Job<T>, jobQueueStrategy: JobQueueStrategy) {
    const config: JobConfig<T> = {
      ...job,
      state: job.state,
      data: job.data,
      id: job.id || undefined,
    };
    super(config);
    this.jobQueueStrategy = jobQueueStrategy;
  }

  public updates(options?: JobUpdateOptions): Observable<JobUpdate<T>> {
    const pollInterval = Math.max(50, options?.pollInterval ?? 200);
    const timeoutMs = Math.max(pollInterval, options?.timeoutMs ?? ms('1h'));
    const strategy = this.jobQueueStrategy;

    if (!isInspectableJobQueueStrategy(strategy)) {
      throw new InternalServerError(
        `The configured JobQueueStrategy (${strategy.constructor.name}) is not inspectable, so Job updates cannot be subscribed to`
      );
    } else {
      return interval(pollInterval).pipe(
        tap((i) => {
          if (timeoutMs < i * pollInterval) {
            throw new Error(
              `Job ${
                this.id ?? ''
              } SubscribableJob update polling timed out after ${timeoutMs}ms. The job may still be running.`
            );
          }
        }),
        switchMap(() => {
          const id = this.id;
          if (!id) {
            throw new Error(
              'Cannot subscribe to update: Job does not have an ID'
            );
          }
          return strategy.findOne(id);
        }),
        filter(notNullOrUndefined),
        distinctUntilChanged(
          (a: Job<T>, b: Job<T>) =>
            a?.progress === b?.progress && a?.state === b?.state
        ),
        takeWhile(
          (job) =>
            job?.state !== JobState.FAILED &&
            job.state !== JobState.COMPLETED &&
            job.state !== JobState.CANCELLED,
          true
        ),
        tap((job) => {
          if (job.state === JobState.FAILED && (options?.errorOnFail ?? true)) {
            throw new Error(job.error);
          }
        }),
        map((job) =>
          pick(job, ['id', 'state', 'progress', 'result', 'error', 'data'])
        )
      );
    }
  }
}
