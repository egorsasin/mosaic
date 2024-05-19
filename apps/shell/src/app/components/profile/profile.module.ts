import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MosProfileComponent } from './profile.component';
import { MosAddressModule } from './address/address.module';

const routes: Routes = [
  {
    path: '',
    component: MosProfileComponent,
  },
];

@NgModule({
  declarations: [MosProfileComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MosAddressModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  providers: [],
  bootstrap: [],
})
export class MosProfileModule {}
