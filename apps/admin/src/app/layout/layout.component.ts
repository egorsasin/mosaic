import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../providers';

@Component({
  selector: 'mos-root',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  public logout(): void {
    this.authService.logOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
