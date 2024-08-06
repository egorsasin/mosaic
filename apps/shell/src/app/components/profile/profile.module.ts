import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { MosProfileComponent } from './profile.component';
import { MosAddressModule } from './address/address.module';

const routes: Routes = [
  {
    path: '',
    component: MosProfileComponent,
  },
];

@NgModule({ declarations: [MosProfileComponent],
    bootstrap: [], imports: [CommonModule,
        MosAddressModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class MosProfileModule {}
