import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  Optional,
  Self,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { NgControl } from '@angular/forms';

import { MosAbstractControl } from '@mosaic/cdk/abstract';

import { DATA_LIST_HOST } from '../tokens';
import { DataListHost } from '../types';
import { MosBaseInputComponent } from '../base-input';
import { MosDropdownListDirective } from '../dropdown';

@Component({
  selector: 'mos-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DATA_LIST_HOST,
      useExisting: forwardRef(() => MosInputComponent),
    },
  ],
})
export class MosInputComponent
  extends MosAbstractControl<string>
  implements DataListHost<string>
{
  private dataList: MosDropdownListDirective | null = null;

  @Input() public placeholder = '';
  @Input() public readonly = false;
  @Input() public labelOutside = false;

  @ViewChild(MosBaseInputComponent, { static: true })
  public baseInput?: MosBaseInputComponent;

  @ContentChild(MosDropdownListDirective, { static: false })
  public set dropdownList(dataList: MosDropdownListDirective | null) {
    if (this.dataList !== dataList) {
      this.dataList = dataList;
      this.changeDetectorRef.markForCheck();
    }
  }

  public get dropdownList(): MosDropdownListDirective | null {
    return this.dataList;
  }

  public open = false;

  constructor(
    @Self() @Optional() ngControl: NgControl,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(ngControl, changeDetectorRef);
  }

  public handleOption(option: string): void {
    this.baseInput?.inputElement?.nativeElement.focus();
    this.updateValue(option);
    this.updateOpen(false);
  }

  public onActiveZone(zone: boolean): void {
    if (!zone) {
      this.open = false;
    }
  }

  public updateOpen(open: boolean): void {
    this.open = open;
  }

  public valueChanges(value: string): void {
    this.updateOpen(true);
    this.updateValue(value);
  }

  public onFocused(focused: boolean): void {
    this.updateFocused(focused);
  }

  protected getFallbackValue(): string {
    return '';
  }
}
