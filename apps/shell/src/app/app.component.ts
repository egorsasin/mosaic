import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mos-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
