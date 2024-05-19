import { Directive, OnInit, TemplateRef } from '@angular/core';

import { SidebarComponent } from '../sidebar.component';
import { Sidebar } from '../sidebar.types';

@Directive({ selector: '[mosSidebarActions]' })
export class SidebarActionsDirective<T extends Sidebar> implements OnInit {
  constructor(
    private sidebar: SidebarComponent<T>,
    private templateRef: TemplateRef<any>
  ) {}

  public ngOnInit() {
    setTimeout(() => this.sidebar.registerActionsTemplate(this.templateRef));
  }
}
