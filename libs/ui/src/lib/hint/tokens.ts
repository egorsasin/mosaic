import { InjectionToken } from '@angular/core';

import { HintComponent } from './hint.component';

export const MOSAIC_HINT_COMPONENT = new InjectionToken(
  '[MOSAIC_HINT_COMPONENT] A component to display a hint',
  {
    factory: () => HintComponent,
  }
);
