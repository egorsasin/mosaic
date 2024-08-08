import {
  ComponentRef,
  Directive,
  EmbeddedViewRef,
  INJECTOR,
  Inject,
  InjectionToken,
  Injector,
  Input,
  OnChanges,
  StaticProvider,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { ContextWrapper } from '../../common';

export const MOSAIC_CONTEXT = new InjectionToken('Mosaic component context');

@Directive({
  selector: '[mosComponentOutlet]',
  standalone: true,
})
export class MosComponentOutletDirective<T, V> implements OnChanges {
  private componentRef?: ComponentRef<T> | EmbeddedViewRef<V>;

  @Input('mosComponentOutlet') wrapper?: ContextWrapper<T> | TemplateRef<V>;

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

    if (this.wrapper instanceof ContextWrapper) {
      const parent =
        this.wrapper.createInjector(this.injector) || this.injector;
      const providers: StaticProvider[] = [
        { provide: MOSAIC_CONTEXT, useValue: this.context },
      ];
      const injector = Injector.create({ parent, providers });

      this.componentRef = this.viewContainerRef.createComponent(
        this.wrapper.component,
        { injector }
      );
    } else if (this.componentRef instanceof TemplateRef) {
      this.componentRef = this.viewContainerRef.createEmbeddedView<V>(
        this.wrapper,
        this.context
      );
    }
  }
}
