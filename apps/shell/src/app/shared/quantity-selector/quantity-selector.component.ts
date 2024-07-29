import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { createNumberMask, MosMaskModule, TextMaskConfig } from '@mosaic/mask';

@Component({
  selector: 'mos-quantity',
  templateUrl: './quantity-selector.component.html',
  styleUrls: ['./quantity-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MosMaskModule],
  exportAs: 'mosQuantity',
})
export class MosQuantitySelectorComponent {
  @Input()
  public value = 1;

  @Input()
  @HostBinding('class.mos-quantity--editable')
  public editable = true;

  @Output()
  public quantityChange: EventEmitter<number> = new EventEmitter<number>();

  public maskConfig: TextMaskConfig = {
    mask: createNumberMask({
      prefix: '',
      allowNegative: false,
      integerLimit: 999,
    }),
  };

  public valueChanges(value: string): void {
    this.emitChanges(value);
  }

  public onBlur(): void {
    this.emitChanges(this.value);
  }

  public add(value = 1): void {
    this.emitChanges(this.value + value);
  }

  private emitChanges(value: number | string) {
    const intValue = parseInt(value.toString());

    this.quantityChange.emit(intValue);
  }
}
