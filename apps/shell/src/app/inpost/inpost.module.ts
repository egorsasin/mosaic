import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  APP_INITIALIZER,
  ModuleWithProviders,
  NgModule,
  PLATFORM_ID,
} from '@angular/core';

import { MosLetDirective, WINDOW } from '@mosaic/cdk';
import { MosDialogModule } from '@mosaic/ui/dialog';

import { MosInpostComponent } from './inpost.component';
import { MosInpostMapComponent } from './inpost-map.component';
import { SHIPPING_METHOD_HANDLER } from '../shipping';
import { InpostService } from './inpost.service';

const SCRIPT_URL = 'https://geowidget.easypack24.net/js/sdk-for-javascript.js';

// eslint-disable-next-line @typescript-eslint/ban-types
const scriptFactory = (platformId: Object) => {
  if (isPlatformBrowser(platformId)) {
    return insertScript;
  }

  return undefined;
};

function insertScript(): void {
  const head = document.getElementsByTagName('head')[0];
  const geoScript: HTMLScriptElement = document.createElement('script');

  geoScript.type = 'text/javascript';
  geoScript.src = SCRIPT_URL;

  head.appendChild(geoScript);
}

@NgModule({
  imports: [CommonModule, MosDialogModule, MosLetDirective],
  declarations: [MosInpostComponent, MosInpostMapComponent],
  exports: [MosInpostComponent],
})
export class InpostModule {
  public static forRoot(): ModuleWithProviders<InpostModule> {
    return {
      ngModule: InpostModule,
      providers: [
        InpostService,
        {
          provide: APP_INITIALIZER,
          useFactory: scriptFactory,
          deps: [PLATFORM_ID, WINDOW],
          multi: true,
        },
        {
          provide: SHIPPING_METHOD_HANDLER,
          useExisting: InpostService,
          multi: true,
        },
      ],
    };
  }
}
