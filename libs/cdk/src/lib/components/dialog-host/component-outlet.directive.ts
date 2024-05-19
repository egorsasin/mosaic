import {
  ComponentRef,
  Directive,
  INJECTOR,
  Inject,
  InjectionToken,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  StaticProvider,
  ViewContainerRef,
} from '@angular/core';

import { ContextWrapper } from '../../common';

export const MOSAIC_CONTEXT = new InjectionToken('Mosaic component context');

@Directive({
  selector: '[mosComponentOutlet]',
  standalone: true,
})
export class MosComponentOutletDirective<T, V> implements OnChanges, OnDestroy {
  private componentRef?: ComponentRef<T>;

  @Input('mosComponentOutlet') wrapper?: ContextWrapper<T>;

  @Input('mosComponentOutletContext') context?: V;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(INJECTOR) private readonly injector: Injector
  ) {}

  public ngOnChanges(): void {
    if (!this.wrapper) {
      return;
    }

    this.viewContainerRef.clear();

    const parent = this.wrapper?.createInjector(this.injector) || this.injector;
    const providers: StaticProvider[] = [
      { provide: MOSAIC_CONTEXT, useValue: this.context },
    ];
    const injector = Injector.create({ parent, providers });

    this.componentRef = this.viewContainerRef.createComponent(
      this.wrapper.component,
      { injector }
    );
  }

  public ngOnDestroy(): void {
    this.componentRef?.destroy();
  }
}
