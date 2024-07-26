import {
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
  Input,
} from '@angular/core';

export const MOS_ICON_PATH = new InjectionToken<string>('MOSAIC Icon Path');

@Component({
  standalone: true,
  selector: 'mos-icon[icon]',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg">
      <use [attr.xlink:href]="iconPath"></use>
    </svg>
  `,
  styleUrls: ['./svg-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosIconComponent {
  @Input({ required: true }) icon?: string;

  private svgPath = inject(MOS_ICON_PATH);

  get iconPath(): string {
    return `${this.svgPath}#${this.icon}`;
  }
}
