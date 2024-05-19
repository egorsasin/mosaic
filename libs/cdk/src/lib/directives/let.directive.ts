import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { MosContext } from '../common';

export class MosLetContext<T> implements MosContext<T> {
  constructor(private readonly internalDirectiveInstance: MosLetDirective<T>) {}

  public get $implicit(): T {
    return this.internalDirectiveInstance.mosLet;
  }

  public get mosLet(): T {
    return this.internalDirectiveInstance.mosLet;
  }
}

@Directive({
  selector: '[mosLet]',
  standalone: true,
})
export class MosLetDirective<T> {
  @Input()
  public mosLet!: T;

  constructor(
    viewContainerRef: ViewContainerRef,
    templateRef: TemplateRef<MosLetContext<T>>
  ) {
    viewContainerRef.createEmbeddedView(
      templateRef,
      new MosLetContext<T>(this)
    );
  }
}
