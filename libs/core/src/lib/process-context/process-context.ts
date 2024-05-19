type ProcessContextType = 'server' | 'worker';
let currentContext: ProcessContextType = 'server';

export class ProcessContext {
  get isServer(): boolean {
    return currentContext === 'server';
  }
  get isWorker(): boolean {
    return currentContext === 'worker';
  }
}

export function setProcessContext(context: ProcessContextType) {
  currentContext = context;
}
