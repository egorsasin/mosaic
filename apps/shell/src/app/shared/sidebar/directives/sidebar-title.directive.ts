import { Directive, Input, OnInit, TemplateRef } from '@angular/core';

import { SidebarComponent } from '../sidebar.component';
import { Sidebar } from '../sidebar.types';

@Directive({ selector: '[mosSidebarTitle]' })
export class SidebarTitleDirective<T extends Sidebar, U> implements OnInit {
  @Input() tsSidebarTitle = '';
  constructor(
    private sidebar: SidebarComponent<T>,
    private templateRef: TemplateRef<U>
  ) {}

  public ngOnInit() {
    setTimeout(() => this.sidebar.registerTitleTemplate(this.templateRef));
  }
}
