import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[mosScrollbarWrapper]',
})
export class MosScrollbarWrapperDirective {
  public get nativeElement() {
    return this.elementRef.nativeElement;
  }

  constructor(private elementRef: ElementRef) {}
}
