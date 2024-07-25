import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { OverlayHostComponent } from '@mosaic/ui/overlay-host';
import { MosDialogHostModule } from '@mosaic/cdk';
import { MosDialogModule } from '@mosaic/ui/dialog';
import { MosAlertModule } from '@mosaic/ui/alert';

import { environment } from '../environments/environment';

import { AppRoutingModule, ROUTED_COMPONENTS } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataModule } from './data/data.module';
import { DefaultInterceptor } from './default.interceptor';
import { orderReducer, customerReducer, CustomerEffects } from './store';
import { EffectsModule } from '@ngrx/effects';
import { CustomerService } from './services';
import { CartModule } from './store/cart';
import { SidebarModule } from './shared/sidebar';

@NgModule({
  declarations: [AppComponent, ...ROUTED_COMPONENTS],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CartModule,
    BrowserAnimationsModule,
    DataModule,
    HttpClientModule,
    StoreModule.forRoot(
      { activeOrder: orderReducer, activeCustomer: customerReducer },
      {}
    ),
    EffectsModule.forRoot([CustomerEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      connectInZone: true,
    }),
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
