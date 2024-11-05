import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[mosHeader]',
  standalone: true,
})
export class FixedHeaderDirective implements AfterViewInit {
  @Input({ required: true })
  public mosHeader?: HTMLElement;

  constructor(private elementRef: ElementRef) {}

  public ngAfterViewInit(): void {
    const clientRect = this.mosHeader?.getBoundingClientRect();
    const nativeElement = this.elementRef.nativeElement;

    nativeElement.style.paddingTop = `${clientRect?.height}px`;
  }
}
