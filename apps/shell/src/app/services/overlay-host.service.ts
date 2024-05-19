import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverlayHostService {
  private hostView!: ViewContainerRef;
  private promiseResolveFns: Array<(result: ViewContainerRef) => void> = [];

  public registerHostView(viewContainerRef: ViewContainerRef): void {
    this.hostView = viewContainerRef;
    if (this.promiseResolveFns.length) {
      this.resolveHostView();
    }
  }

  public getHostView(): Promise<ViewContainerRef> {
    return new Promise((resolve: (result: ViewContainerRef) => void) => {
      this.promiseResolveFns.push(resolve);
      if (this.hostView !== undefined) {
        this.resolveHostView();
      }
    });
  }

  private resolveHostView(): void {
    this.promiseResolveFns.forEach((resolve) => {
      resolve(this.hostView);
    });
    this.promiseResolveFns = [];
  }
}
