import { Directive, DoCheck, inject } from '@angular/core';
import { MosInputPasswordComponent } from './input-password.component';

@Directive({
  selector: 'mos-input-password',
})
export class MosInputPasswordDirective implements DoCheck {
  private readonly host: MosInputPasswordComponent =
    inject<MosInputPasswordComponent>(MosInputPasswordComponent);

  public ngDoCheck(): void {
    if (this.host.baseInput?.inputElement) {
      this.host.baseInput.inputElement.nativeElement.type = this.host.inputType;
    }
  }
}
