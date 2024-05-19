import {
  animate,
  state,
  style,
  transition,
  trigger,
  AnimationEvent,
} from '@angular/animations';
import { Component, HostBinding, TemplateRef, Type } from '@angular/core';
import { Subject } from 'rxjs';

import { Sidebar, SidebarOptions } from './sidebar.types';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'aside[mosSidebar]',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('state', [
      state('void, hidden', style({ transform: 'translateX(100%)' })),
      state('visible', style({ transform: 'translateX(0)' })),
      transition('* => visible', animate('200ms linear')),
      transition('* => hidden', animate('200ms linear')),
    ]),
  ],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.mos-visible]': 'visibility === "visible"',
  },
})
export class SidebarComponent<T extends Sidebar<any>> {
  private result: any;

  public actionsTemplateRef$ = new Subject<TemplateRef<any>>();
  public titleTemplateRef$ = new Subject<TemplateRef<any>>();
  public visibility = 'visible';
  public childComponentType!: Type<T>;
  public options?: SidebarOptions<T>;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public closeSidebar: (result?: any) => void = () => {};

  public onCreate(componentInstance: any) {
    componentInstance.resolveSidebarWith = (result?: any) => {
      this.result = result;
      this.visibility = 'hidden';
    };
    if (this.options && this.options.locals) {
      for (const key in this.options.locals) {
        componentInstance[key] = this.options.locals[key] as T[Extract<
          keyof T,
          string
        >];
      }
    }
  }

  public animationDone(event: AnimationEvent) {
    if (event.toState === 'hidden') {
      this.closeSidebar(this.result);
    }
  }

  public onActiveZone(activeZone: boolean) {
    if (!activeZone) {
      this.close();
    }
  }

  public close(): void {
    this.visibility = 'hidden';
  }

  public registerActionsTemplate<T>(actionsTemplateRef: TemplateRef<T>): void {
    this.actionsTemplateRef$.next(actionsTemplateRef);
  }

  public registerTitleTemplate(titleTemplateRef: TemplateRef<any>): void {
    this.titleTemplateRef$.next(titleTemplateRef);
  }
}
