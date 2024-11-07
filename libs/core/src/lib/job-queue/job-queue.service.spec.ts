import { firstValueFrom, Subject } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { assertFound } from '@mosaic/common';

import { JobQueueService } from './job-queue.service';
import { ConfigService } from '../config';
import { Injector } from '../api';
import { InMemoryJobQueueStrategy } from './strategies';
import { Job } from './job';
import { JobData } from './types';
import { ProcessContext, setProcessContext } from '../process-context';
import { JobState } from '../common';

const queuePollInterval = 200;

function getJob(job: Job<any> | number): Promise<Job<any>> {
  const id = typeof job === 'number' ? job : job.id;

  return assertFound(testJobQueueStrategy.findOne(id));
}

function tick(ms = 0): Promise<void> {
  return new Promise<void>((resolve) => {
    if (ms > 0) {
      setTimeout(resolve, ms);
    } else {
      process.nextTick(resolve);
    }
  });
}

export class TestingJobQueueStrategy extends InMemoryJobQueueStrategy {
  async prePopulate(jobs: Job[]) {
    for (const job of jobs) {
      await this.add(job);
    }
  }

  override async stop<Data extends JobData<Data> = object>(
    queueName: string,
    process: (job: Job<Data>) => Promise<any>
  ) {
    const active = this.activeQueues.getAndDelete(queueName, process);
    if (!active) {
      return;
    }
    await active.stop(1_000);
  }
}

const testJobQueueStrategy = new TestingJobQueueStrategy({
  concurrency: 1,
  pollInterval: queuePollInterval,
  backoffStrategy: () => 0,
});

describe('JobQueueService', () => {
  let module: TestingModule;
  let jobQueueService: JobQueueService;

  beforeEach(async () => {
    setProcessContext('server');

    module = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useClass: MockConfigService },
        JobQueueService,
        ProcessContext,
      ],
    }).compile();

    await module.init();

    jobQueueService = module.get(JobQueueService);

    await jobQueueService.start();
  });

  afterEach(async () => {
    await module.close();
  });

  it('data is passed into job', async () => {
    const subject = new Subject<string>();
    const subNext = firstValueFrom(subject);

    const testQueue = await jobQueueService.createQueue<string>({
      name: 'test',
      process: async (job) => {
        subject.next(job.data);
      },
    });

    await testQueue.add('hello');
    const data = await subNext;
    expect(data).toBe('hello');
  });

  it('job marked as complete', async () => {
    const subject = new Subject<string>();

    const testQueue = await jobQueueService.createQueue<string>({
      name: 'test',
      process: async () => firstValueFrom(subject),
    });

    const testJob: Job<string> = await testQueue.add('hello');

    await tick(queuePollInterval);
    expect((await getJob(testJob)).state).toBe(JobState.RUNNING);

    subject.next('yay');
    subject.complete();

    await tick();

    expect((await getJob(testJob)).result).toBe('yay');
  });

  it('job marked as failed when exception thrown', async () => {
    const subject = new Subject<string>();
    const testQueue = await jobQueueService.createQueue<string>({
      name: 'test',
      process: async () => {
        const result = await firstValueFrom(subject);
        throw result;
      },
    });

    const testJob = await testQueue.add('hello');
    expect(testJob.state).toBe(JobState.PENDING);

    await tick(queuePollInterval);
    expect((await getJob(testJob)).state).toBe(JobState.RUNNING);

    subject.next('uh oh');
    subject.complete();
    await tick();

    expect((await getJob(testJob)).state).toBe(JobState.FAILED);
    expect((await getJob(testJob)).error).toBe('uh oh');
  });

  it('job marked as failed when async error thrown', async () => {
    const err = new Error('something bad happened');
    const testQueue = await jobQueueService.createQueue<string>({
      name: 'test',
      process: async () => {
        throw err;
      },
    });

    const testJob = await testQueue.add('hello');
    expect(testJob.state).toBe(JobState.PENDING);

    await tick(queuePollInterval);
    expect((await getJob(testJob)).state).toBe(JobState.FAILED);
    expect((await getJob(testJob)).error).toBe(err.message);
  });

  it('jobs processed in FIFO queue', async () => {
    const subject = new Subject<void>();
    const testQueue = await jobQueueService.createQueue<string>({
      name: 'test',
      process: () => {
        return firstValueFrom(subject);
      },
    });

    const testJob1 = await testQueue.add('1');
    const testJob2 = await testQueue.add('2');
    const testJob3 = await testQueue.add('3');

    const getStates = async () => [
      (await getJob(testJob1)).state,
      (await getJob(testJob2)).state,
      (await getJob(testJob3)).state,
    ];

    await tick(queuePollInterval);

    expect(await getStates()).toEqual([
      JobState.RUNNING,
      JobState.PENDING,
      JobState.PENDING,
    ]);

    subject.next();
    await tick();
    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.PENDING,
      JobState.PENDING,
    ]);

    await tick(queuePollInterval);
    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.RUNNING,
      JobState.PENDING,
    ]);

    subject.next();
    await tick();
    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.COMPLETED,
      JobState.PENDING,
    ]);

    await tick(queuePollInterval);
    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.COMPLETED,
      JobState.RUNNING,
    ]);

    subject.next();
    await tick();
    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.COMPLETED,
      JobState.COMPLETED,
    ]);

    subject.complete();
  });

  it('with concurrency', async () => {
    const testingJobQueueStrategy = module.get(ConfigService).jobQueueOptions
      .jobQueueStrategy as TestingJobQueueStrategy;

    testingJobQueueStrategy.concurrency = 2;

    const subject = new Subject<void>();
    const testQueue = await jobQueueService.createQueue<string>({
      name: 'test',
      process: () => {
        return firstValueFrom(subject);
      },
    });

    const testJob1 = await testQueue.add('1');
    const testJob2 = await testQueue.add('2');
    const testJob3 = await testQueue.add('3');

    const getStates = async () => [
      (await getJob(testJob1)).state,
      (await getJob(testJob2)).state,
      (await getJob(testJob3)).state,
    ];

    await tick(queuePollInterval);

    expect(await getStates()).toEqual([
      JobState.RUNNING,
      JobState.RUNNING,
      JobState.PENDING,
    ]);

    subject.next();
    await tick();

    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.COMPLETED,
      JobState.PENDING,
    ]);

    await tick(queuePollInterval);
    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.COMPLETED,
      JobState.RUNNING,
    ]);

    subject.next();
    await tick();
    expect(await getStates()).toEqual([
      JobState.COMPLETED,
      JobState.COMPLETED,
      JobState.COMPLETED,
    ]);

    subject.complete();
  });
});

@Injectable()
class MockConfigService implements OnApplicationBootstrap, OnModuleDestroy {
  constructor(private moduleRef: ModuleRef) {}

  jobQueueOptions = {
    jobQueueStrategy: testJobQueueStrategy,
    activeQueues: [],
    // jobBufferStorageStrategy: testJobBufferStorageStrategy,
  };

  systemOptions = {
    errorHandlers: [],
  };

  async onApplicationBootstrap() {
    const injector = new Injector(this.moduleRef);
    this.jobQueueOptions.jobQueueStrategy.init(injector);
  }

  async onModuleDestroy() {
    this.jobQueueOptions.jobQueueStrategy.destroy();
  }
}
