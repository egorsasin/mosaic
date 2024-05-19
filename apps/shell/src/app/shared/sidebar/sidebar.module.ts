import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MosScrollModule } from '@mosaic/ui/scroll';

import { SidebarActionsDirective } from './directives/sidebar-actions.directive';
import { SidebarTitleDirective } from './directives/sidebar-title.directive';
import { SidebarOutletComponent } from './sidebar-outlet.component';
import { SidebarComponent } from './sidebar.component';
import { SidebarService } from './sidebar.service';
import { MosActiveZoneDirective } from '@mosaic/ui/active-zone';

const DECLARATION = [
  SidebarComponent,
  SidebarOutletComponent,
  SidebarTitleDirective,
  SidebarActionsDirective,
];

@NgModule({
  imports: [MosActiveZoneDirective, CommonModule, MosScrollModule],
  declarations: [...DECLARATION],
  exports: [...DECLARATION],
  providers: [SidebarService],
})
export class SidebarModule {}
