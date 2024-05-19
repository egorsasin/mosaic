import { Directive, ElementRef } from '@angular/core';

import { GoogleLoginProvider } from '../services/google-login-provider.service';

declare const google: any;

@Directive({
  selector: '[app-google-signin]',
})
export class GoogleSigninButtonDirective {
  constructor(
    googleLoginProvider: GoogleLoginProvider,
    elementRef: ElementRef
  ) {
    googleLoginProvider.state.then(() => {
      google.accounts.id.renderButton(elementRef.nativeElement, {
        type: 'standard',
        theme: 'outline',
        text: 'signin_with',
        size: 'medium',
        width: '400',
        logo_alignment: 'center',
      });
    });
  }
}
