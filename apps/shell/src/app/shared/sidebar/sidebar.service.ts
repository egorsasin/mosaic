import { Inject, Injectable, INJECTOR, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs';

import { OverlayHostService } from '@mosaic/ui/overlay-host';
import { ContextWrapper } from '@mosaic/cdk';

import { SidebarComponent } from './sidebar.component';
import { Sidebar, SidebarOptions } from './sidebar.types';

@Injectable()
export class SidebarService {
  constructor(
    private overlayHostService: OverlayHostService,
    @Inject(INJECTOR) private injector: Injector
  ) {}

  public sidebar<T extends Sidebar<any>, R>(
    component: Type<T> & Type<Sidebar<R>>,
    options?: SidebarOptions<T>
  ): Observable<R | undefined> {
    const contextWrapper = new ContextWrapper(SidebarComponent, this.injector);
    const sidebarComponentRef = this.overlayHostService.add(contextWrapper);

    const sidebarInstance: SidebarComponent<T> =
      sidebarComponentRef.instance as SidebarComponent<T>;

    sidebarInstance.childComponentType = component;
    sidebarInstance.options = options;

    return new Observable<R>((subscriber) => {
      sidebarInstance.closeSidebar = (result: R) => {
        sidebarComponentRef.destroy();
        subscriber.next(result);
        subscriber.complete();
      };
      return () => {
        sidebarInstance.closeSidebar();
      };
    });
  }
}
