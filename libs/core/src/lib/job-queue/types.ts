import { RequestContext } from '../api';
import { JobState } from '../common';
import { Job } from './job';

export type JobProcess<T extends JsonCompatible<T>> = (
  job: Job<T>
) => Promise<T | void>;

/**
 * @description
 * A type representing JSON-compatible values.
 * From https://github.com/microsoft/TypeScript/issues/1897#issuecomment-580962081
 *
 * @docsCategory common
 */
export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends Json
    ? T[P]
    : Pick<T, P> extends Required<Pick<T, P>>
    ? never
    : JsonCompatible<T[P]>;
};

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [prop: string]: Json };

export type JobData<T> = JsonCompatible<T>;

export interface QueueOptions<T extends JobData<T>> {
  name: string;
  process: JobProcess<T>;
}

export interface JobConfig<T extends JobData<T>> {
  queueName: string;
  data: T;
  retries?: number;
  attempts?: number;
  id?: string | number;
  state?: JobState;
  progress?: number;
  result?: unknown;
  error?: unknown;
  createdAt?: Date;
  startedAt?: Date;
  settledAt?: Date;
}

export type JobOptions<Data extends JsonCompatible<Data>> = Pick<
  JobConfig<Data>,
  'retries'
> & {
  ctx?: RequestContext;
};

export type JobQueueStrategyJobOptions<Data extends JsonCompatible<Data>> =
  Omit<JobOptions<Data>, 'retries'>;
