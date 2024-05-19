import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

import * as cartEffects from './cart.effects';
import { MiniCartModule } from '../../shared/mini-cart/mini-cart.module';

@NgModule({
  declarations: [],
  exports: [],
  imports: [EffectsModule.forFeature(cartEffects)],
})
export class CartModule {}
