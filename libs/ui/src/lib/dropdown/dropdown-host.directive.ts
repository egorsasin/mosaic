import { Directive, ElementRef, InjectionToken } from '@angular/core';

export interface PositionProvider {
  clientRect: DOMRect;
}

export const HOST_POSITION = new InjectionToken<PositionProvider>(
  'Dropdown host position'
);

@Directive({
  selector: `[mosDropdown]`,
  providers: [
    { provide: HOST_POSITION, useExisting: MosDropdownHostDirective },
  ],
})
export class MosDropdownHostDirective implements PositionProvider {
  public get clientRect(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }

  constructor(private elementRef: ElementRef) {}
}
