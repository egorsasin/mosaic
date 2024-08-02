import { InjectionToken } from '@angular/core';

import { ListOptions } from '../types';

export const DEFAULT_LIST_OPTIONS = new InjectionToken<ListOptions>(
  `[DEFAULT_LIST_OPTIONS]: Default list options`
);
