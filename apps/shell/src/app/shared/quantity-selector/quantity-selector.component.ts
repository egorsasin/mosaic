import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MosAbstractControl } from '@mosaic/cdk';

import { createNumberMask, MosMaskModule, TextMaskConfig } from '@mosaic/mask';

export const fadeInOutAnimations = [
  trigger('fade', [
    transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in-out')]),
    transition(':leave', [animate('300ms ease-in-out', style({ opacity: 0 }))]),
  ]),
];

@Component({
  selector: 'mos-quantity',
  templateUrl: './quantity-selector.component.html',
  styleUrls: ['./quantity-selector.component.scss'],
  standalone: true,
  animations: [fadeInOutAnimations],
  imports: [CommonModule, FormsModule, MosMaskModule],
  exportAs: 'mosQuantity',
})
export class MosQuantitySelectorComponent extends MosAbstractControl<number> {
  protected override getFallbackValue(): number {
    return 1;
  }

  @Input()
  @HostBinding('class.mos-quantity--loading')
  public loading = false;

  @Input()
  @HostBinding('class.mos-quantity--editable')
  public editable = true;

  public maskConfig: TextMaskConfig = {
    mask: createNumberMask({
      prefix: '',
      allowNegative: false,
      integerLimit: 999,
    }),
  };

  public valueChanges(value: string): void {
    this.updateValue(parseInt(value, 10));
  }

  public add(value = 1): void {
    this.updateValue(this.value + value);
  }
}
