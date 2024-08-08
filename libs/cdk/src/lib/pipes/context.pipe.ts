import { inject, Injector, Pipe, PipeTransform } from '@angular/core';

import { MOSAIC_CONTEXT } from '../components';

@Pipe({
  name: 'mosContext',
  standalone: true,
})
export class MosContextPipe<T> implements PipeTransform {
  private injector = inject(Injector);

  transform(useValue: T): Injector {
    return Injector.create({
      providers: [
        {
          provide: MOSAIC_CONTEXT,
          useValue,
        },
      ],
      parent: this.injector,
    });
  }
}
