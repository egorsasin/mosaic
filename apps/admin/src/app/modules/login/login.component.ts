import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../providers';

@Component({
  selector: 'mos-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  protected loginForm: FormGroup = new FormGroup({
    username: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    password: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  constructor(private authService: AuthService) {}

  public login(): void {
    console.log(this.loginForm.valid, this.loginForm.value);
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.logIn(username, password).subscribe((result) => {
      console.log('__RESULT__', result);
    });
  }
}
