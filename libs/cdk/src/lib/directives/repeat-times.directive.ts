import {
  Directive,
  Inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MosContext } from '../common';
import { clamp } from '../utils';

const MAX_VALUE = 0x10000;

export class MosRepeatTimesContext implements MosContext<number> {
  constructor(readonly $implicit: number) {}
}

@Directive({
  selector: '[mosRepeatTimes][mosRepeatTimesOf]',
  standalone: true,
})
export class MosRepeatTimesDirective {
  @Input()
  set mosRepeatTimesOf(count: number) {
    const safeCount = Math.floor(clamp(count, 0, MAX_VALUE));

    const { length } = this.viewContainerRef;

    if (count < length) {
      this.removeContainers(length - count);
    } else {
      this.addContainers(safeCount);
    }
  }

  constructor(
    @Inject(ViewContainerRef)
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(TemplateRef)
    private readonly templateRef: TemplateRef<MosRepeatTimesContext>
  ) {}

  private addContainers(count: number): void {
    for (let index = this.viewContainerRef.length; index < count; index++) {
      this.viewContainerRef.createEmbeddedView<MosRepeatTimesContext>(
        this.templateRef,
        new MosRepeatTimesContext(index)
      );
    }
  }

  private removeContainers(amount: number): void {
    for (let index = 0; index < amount; index++) {
      this.viewContainerRef.remove();
    }
  }
}
