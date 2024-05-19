import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  inject,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Component({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'input[type="checkbox"][mosSwitch]',
  template: '',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[attr.disabled]': '!control || control?.disabled || null',
  },
})
export class MosSwitchComponent {
  private readonly el: HTMLInputElement = inject(ElementRef).nativeElement;

  protected readonly control = inject(NgControl, {
    optional: true,
    self: true,
  });

  @HostBinding('class.readonly')
  public get readonly(): boolean {
    return !this.control || !!this.control?.disabled;
  }
}
