import { Directive, Input, Renderer2 } from '@angular/core';

import { MosInputComponent } from './input.component';

@Directive({
  selector: 'mos-input[mosAutofill]',
})
export class MosAutofilltDirective {
  @Input({ required: true }) set mosAutofill(value: string) {
    requestAnimationFrame(() => {
      const inputElement =
        this.mosInputComponent.baseInput?.inputElement?.nativeElement;

      this.renderer.setAttribute(inputElement, 'autocomplete', value);
    });
  }

  constructor(
    private renderer: Renderer2,
    private mosInputComponent: MosInputComponent
  ) {}
}
