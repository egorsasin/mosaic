import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';

import { environment } from '../../environments/environment';
import { orderReducer } from './order.reducer';
import { customerReducer } from './customer.reducer';
import { CustomerEffects } from './customer.effects';
import * as notificationEffects from './notifications/notifications.effects';
import * as orderEffects from './order.effects';
import { CartStoreModule } from './cart';

@NgModule({
  declarations: [],
  imports: [
    CartStoreModule,
    StoreModule.forRoot(
      { activeOrder: orderReducer, activeCustomer: customerReducer },
      {}
    ),
    EffectsModule.forRoot([CustomerEffects, notificationEffects, orderEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      connectInZone: true,
    }),
  ],
})
export class MosStoreModule {}
