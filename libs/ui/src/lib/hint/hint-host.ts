import { Directive, Input } from '@angular/core';

import { ClientRectAccessor } from '../types';

@Directive({
  selector: '[mosHint][hintHost]',
  providers: [{ provide: ClientRectAccessor, useExisting: HintHostDirective }],
})
export class HintHostDirective {
  @Input() public hintHost?: HTMLElement;

  public getClientRect(): DOMRect {
    return this.hintHost?.getBoundingClientRect() || ({} as DOMRect);
  }
}
