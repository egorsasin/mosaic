import { Injector } from '../../api';
import { Job } from '../job';
import { JobData } from '../types';

type ProcessFunc<T extends JobData<T> = object> = (
  job: Job<T>
) => Promise<unknown>;

export abstract class InjectableJobQueueStrategy {
  protected started = new Map<string, ProcessFunc<unknown>>();
  protected hasInitialized = false;

  public init(injector: Injector) {
    this.hasInitialized = true;

    for (const [queueName, process] of this.started) {
      this.start(queueName, process);
    }

    this.started.clear();
  }

  public destroy() {
    this.hasInitialized = false;
  }

  public abstract start<Data extends JobData<Data> = object>(
    queueName: string,
    process: (job: Job<Data>) => Promise<Data>
  ): void;
}
