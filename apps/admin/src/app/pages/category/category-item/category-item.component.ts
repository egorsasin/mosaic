import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { createNumberMask, TextMaskConfig } from '@mosaic/mask';
import { Asset, Product } from '@mosaic/common';

import { BaseDetailComponent } from '../../asset/asset-list/base-detail.component';

interface ProductForm {
  name: FormControl<string>;
  slug: FormControl<string>;
}

interface SelectedAssets {
  assets?: Asset[];
  featuredAsset?: Asset;
}

@Component({
  selector: 'mos-category-item',
  templateUrl: './category-item.component.html',
})
export class CategoryItemComponent extends BaseDetailComponent<Product> {
  public maskConfig: TextMaskConfig = {
    mask: createNumberMask({
      prefix: '',
      allowNegative: false,
    }),
  };
  public detailForm: FormGroup<ProductForm> = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    slug: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  public assetChanges: SelectedAssets = {};

  public get assetsChanged(): boolean {
    return !!Object.values(this.assetChanges).length;
  }

  constructor() {
    super();
    this.init();
  }

  protected setFormValues(entity: Product): void {
    this.detailForm.patchValue(entity);
  }
}
