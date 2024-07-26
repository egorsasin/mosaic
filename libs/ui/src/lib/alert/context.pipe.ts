import { inject, Injector, Pipe, PipeTransform } from '@angular/core';
import { MOSAIC_CONTEXT } from '@mosaic/cdk';

@Pipe({
  name: 'mosContext',
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
