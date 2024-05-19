import { ComponentRef, Injectable } from '@angular/core';

import { ContextWrapper } from '@mosaic/cdk/common';

import { OverlayHostComponent } from './overlay-host.component';

@Injectable({ providedIn: 'root' })
export class OverlayHostService {
  private host?: OverlayHostComponent;

  protected get safeHost(): OverlayHostComponent {
    if (!this.host) {
      throw new Error(`Overlay cannot be used without OverlayHostComponent`);
    }

    return this.host;
  }

  public registerHost(host: OverlayHostComponent): void {
    this.host = host;
  }

  public add<T>(component: ContextWrapper<T>): ComponentRef<T> {
    return this.safeHost.addComponentChild(component);
  }

  public remove<T>({ hostView }: ComponentRef<T>): void {
    hostView.destroy();
  }
}
