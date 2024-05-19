import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { GoogleSigninButtonDirective } from '../directives/google-signin-button.directive';
import { GoogleAuthService } from '../services/google-auth.service';

import { AuthComponent } from './auth.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
  },
];

@NgModule({
  declarations: [AuthComponent, GoogleSigninButtonDirective],
  imports: [CommonModule, RouterModule.forChild(routes)],
  providers: [GoogleAuthService],
})
export class AuthModule {}
