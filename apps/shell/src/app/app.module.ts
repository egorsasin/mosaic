import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { OverlayHostComponent } from '@mosaic/ui/overlay-host';
import { MosDialogHostModule } from '@mosaic/cdk';
import { MosDialogModule } from '@mosaic/ui/dialog';
import { MosAlertModule } from '@mosaic/ui/alert';
import { MOS_ICON_PATH } from '@mosaic/ui/svg-icon';

import { AppRoutingModule, ROUTED_COMPONENTS } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataModule } from './data/data.module';
import { DefaultInterceptor } from './default.interceptor';
import { CustomerService } from './services';
import { SidebarModule } from './shared/sidebar';
import { MosStoreModule } from './store/store.module';
@NgModule({
  declarations: [AppComponent, ...ROUTED_COMPONENTS],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DataModule,
    MosStoreModule,
    // Standalone components
    OverlayHostComponent,
    MosAlertModule,
    MosDialogHostModule,
    MosDialogModule,
    SidebarModule,
  ],
  providers: [
    CustomerService,
    { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
    { provide: MOS_ICON_PATH, useValue: '/assets/icons/main.svg' },
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
