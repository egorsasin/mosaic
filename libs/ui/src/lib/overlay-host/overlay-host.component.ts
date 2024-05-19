import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  Inject,
  INJECTOR,
  Injector,
  ViewContainerRef,
} from '@angular/core';

import { ContextWrapper } from '@mosaic/cdk/common';

import { OverlayHostService } from './overlay-host.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mos-overlay',
  template: '<!-- MOSAIC OVERLAY -->',
})
export class OverlayHostComponent {
  constructor(
    @Inject(INJECTOR) private readonly injector: Injector,
    public viewContainerRef: ViewContainerRef,
    overlayHostService: OverlayHostService
  ) {
    overlayHostService.registerHost(this);
  }

  public addComponentChild<T>(wrapper: ContextWrapper<T>): ComponentRef<T> {
    const parent = wrapper.createInjector(this.injector);
    const providers = [{ provide: OverlayHostComponent, useValue: this }];
    const injector = Injector.create({ parent, providers });
    const ref = this.viewContainerRef.createComponent(wrapper.component, {
      injector,
    });

    ref.changeDetectorRef.detectChanges();

    return ref;
  }
}
