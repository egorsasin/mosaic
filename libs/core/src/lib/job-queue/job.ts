import { JobState } from '../common';
import { JobConfig, JobData } from './types';
import { Logger } from '../config';
import { isClassInstance, isObject } from '@mosaic/common';

export type JobEventType = 'progress';

export type JobEventListener<T extends JobData<T>> = (job: Job<T>) => void;

export class Job<T extends JobData<T> = object> {
  public readonly id: number | string;
  readonly queueName: string;
  readonly retries: number;

  private readonly _data: T;
  private _state: JobState = JobState.PENDING;
  private _attempts: number;
  private _startedAt?: Date;
  private _settledAt?: Date;
  private _progress: number;
  private _result?: T;
  private _error?: string;

  private readonly eventListeners: {
    [type in JobEventType]: Array<JobEventListener<T>>;
  } = {
    progress: [],
  };

  public get attempts(): number {
    return this._attempts;
  }

  public get state(): JobState {
    return this._state;
  }

  public get data(): T {
    return this._data;
  }

  public get result(): T {
    return this._result;
  }

  public get error(): string {
    return this._error;
  }

  public get progress(): number {
    return this._progress;
  }

  constructor({ id, state, ...config }: JobConfig<T>) {
    this.queueName = config.queueName;
    this.retries = config.retries || 0;
    this._startedAt = config.startedAt;
    this.id = id;
    this._state = state || JobState.PENDING;
    this._data = this.ensureDataIsSerializable(config.data);
  }

  public start(): void {
    if (this._state === JobState.PENDING || this._state === JobState.RETRYING) {
      this._state = JobState.RUNNING;
      this._startedAt = new Date();
      this._attempts++;

      Logger.debug(
        `Job ${this.id?.toString() ?? 'null'} [${
          this.queueName
        }] starting (attempt ${this._attempts} of ${this.retries + 1})`
      );
    }
  }

  public cancel() {
    this._settledAt = new Date();
    this._state = JobState.CANCELLED;
  }

  /**
   * Sets a RUNNING job back to PENDING. Should be used when the JobQueue is being
   * destroyed before the job has been completed.
   */
  public defer(): void {
    if (this._state === JobState.RUNNING) {
      this._state = JobState.PENDING;
      this._attempts = 0;

      Logger.debug(
        `Job ${this.id?.toString() ?? 'null'} [${
          this.queueName
        }] deferred back to PENDING state`
      );
    }
  }

  /**
   * Calling this method signifies that the job succeeded. The result
   * will be stored in the `Job.result` property.
   */
  public complete(result?: T): void {
    this._result = result;
    this._progress = 100;
    this._state = JobState.COMPLETED;
    this._settledAt = new Date();

    Logger.debug(
      `Job ${this.id?.toString() ?? 'null'} [${this.queueName}] completed`
    );
  }

  /**
   * Calling this method signifies that the job failed.
   */
  public fail(err?: any): void {
    this._error = err?.message ? err.message : String(err);
    this._progress = 0;

    if (this.retries >= this._attempts) {
      this._state = JobState.RETRYING;

      Logger.warn(
        `Job ${this.id?.toString() ?? 'null'} [${
          this.queueName
        }] failed (attempt ${this._attempts} of ${this.retries + 1})`
      );
    } else {
      if (this._state !== JobState.CANCELLED) {
        this._state = JobState.FAILED;

        Logger.warn(
          `Job ${this.id?.toString() ?? 'null'} [${
            this.queueName
          }] failed and will not retry.`
        );
      }

      this._settledAt = new Date();
    }
  }

  public on(eventType: JobEventType, listener: JobEventListener<T>): void {
    this.eventListeners[eventType].push(listener);
  }

  public off(eventType: JobEventType, listener: JobEventListener<T>): void {
    const idx = this.eventListeners[eventType].indexOf(listener);

    if (idx !== -1) {
      this.eventListeners[eventType].splice(idx, 1);
    }
  }

  /**
   * All data in a job must be serializable. This method handles certain problem cases such as when
   * the data is a class instance with getters. Even though technically the "data" object should
   * already be serializable per the TS type, in practice data can slip through due to loss of
   * type safety.
   */
  private ensureDataIsSerializable(data: any, depth = 0): any {
    if (10 < depth) {
      return '[max depth reached]';
    }
    depth++;
    let output: any;
    if (data instanceof Date) {
      return data.toISOString();
    } else if (isObject(data)) {
      if (!output) {
        output = {};
      }
      for (const key of Object.keys(data)) {
        output[key] = this.ensureDataIsSerializable((data as any)[key], depth);
      }
      if (isClassInstance(data)) {
        const descriptors = Object.getOwnPropertyDescriptors(
          Object.getPrototypeOf(data)
        );
        for (const name of Object.keys(descriptors)) {
          const descriptor = descriptors[name];
          if (typeof descriptor.get === 'function') {
            output[name] = (data as any)[name];
          }
        }
      }
    } else if (Array.isArray(data)) {
      if (!output) {
        output = [];
      }
      data.forEach((item, i) => {
        output[i] = this.ensureDataIsSerializable(item, depth);
      });
    } else {
      return data;
    }
    return output;
  }
}
