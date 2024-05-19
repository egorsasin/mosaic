import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject, switchMap, takeUntil } from 'rxjs';

import { GoogleAuthService } from '../services/google-auth.service';
import { GoogleLoginProvider } from '../services/google-login-provider.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'mos-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private googleLoginProvider: GoogleLoginProvider,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.googleLoginProvider.credentials
      .pipe(
        takeUntil(this.destroy$),
        switchMap((token: string) =>
          this.googleAuthService.authenticate(token)
        ),
        switchMap(({ authenticate }: any) => {
          if (authenticate.__typename === 'CurrentUser') {
            const { identifier } = authenticate;
            return this.authService.loginSuccess(identifier);
          }
          return of(authenticate);
        })
      )
      .subscribe((data: any) => {
        if (data.__typename === 'CurrentUser') {
          this.router.navigateByUrl('/profile');
        }
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
