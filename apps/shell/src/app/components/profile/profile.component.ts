import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mos-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosProfileComponent {}
