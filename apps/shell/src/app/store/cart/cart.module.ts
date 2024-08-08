import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import * as cartEffects from './cart.effects';

@NgModule({
  declarations: [],
  exports: [],
  imports: [EffectsModule.forFeature(cartEffects)],
})
export class CartStoreModule {}
