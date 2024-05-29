import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MosMaskModule, TextMaskConfig } from '@mosaic/mask';

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

  @Output()
  public quantityChange: EventEmitter<number> = new EventEmitter<number>();

  public maskConfig: TextMaskConfig = {
    mask: [/[1-9]/],
  };

  public valueChanges(value: number): void {
    this.value = value;
    this.quantityChange.emit(value);
  }

  public add(value = 1): void {
    this.value = this.value + value;
    this.quantityChange.emit(this.value);
  }
}
