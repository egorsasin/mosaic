import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs';

import { DataService } from '../../data';
import { AuthService } from '../../auth/auth.service';
import { GET_USER_STATUS, UserStatusQuery } from '../../data/client';
import { Router } from '@angular/router';

@Component({
  selector: 'mos-user-status',
  templateUrl: './user-status.component.html',
  styleUrls: ['./user-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserStatusComponent {
  public userStatus = this.dataService
    .query<UserStatusQuery>(GET_USER_STATUS, {}, 'cache-first')
    .stream$.pipe(map(({ userStatus }) => userStatus));

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private readonly router: Router
  ) {}

  public logOut(): void {
    this.authService.logOut().subscribe(() => this.router.navigate(['/']));
  }
}
