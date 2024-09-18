import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { OverlayHostComponent } from '@mosaic/ui/overlay-host';
import { MosDialogHostModule } from '@mosaic/cdk';
import { MosDialogModule } from '@mosaic/ui/dialog';
import { MosAlertModule } from '@mosaic/ui/alert';
import { MOS_ICON_PATH, MosIconComponent } from '@mosaic/ui/svg-icon';

import { AppComponent } from './app.component';
import { AppRoutingModule, ROUTED_COMPONENTS } from './app-routing.module';
import { MosDynamicControlModule } from './dynamic-control/dynamic-control.module';
import { DataModule } from './data';

@NgModule({
  declarations: [AppComponent, ...ROUTED_COMPONENTS],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    DataModule.forRoot(),
    MosDynamicControlModule.forRoot(),
    RouterModule.forRoot([]),
    OverlayHostComponent,
    MosDialogHostModule,
    MosDialogModule,
    MosAlertModule,
    MosIconComponent,
    AppRoutingModule,
  ],
  providers: [{ provide: MOS_ICON_PATH, useValue: '/assets/icons/main.svg' }],
})
export class AppModule {}
