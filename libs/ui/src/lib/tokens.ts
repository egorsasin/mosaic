import { InjectionToken } from '@angular/core';
import { DataListHost } from './types';

export const DATA_LIST_HOST = new InjectionToken<DataListHost<unknown>>(
  'Host component for data list'
);
