import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Maybe } from 'graphql/jsutils/Maybe';

import { createNumberMask, TextMaskConfig } from '@mosaic/mask';

import { Asset, Product } from '../../../common';
import { BaseDetailComponent } from '../../asset/asset-list/base-detail.component';
import { mergeMap, take } from 'rxjs/operators';
import { ProductDataService } from '../product.service';

interface ProductForm {
  name: FormControl<string>;
  slug: FormControl<string>;
  description: FormControl<string>;
  enabled: FormControl<boolean>;
  price: FormControl<Maybe<number>>;
}

interface SelectedAssets {
  assets?: Asset[];
  featuredAsset?: Asset;
}

@Component({
  selector: 'mosaic-product-item',
  templateUrl: './product-item.component.html',
})
export class ProductItemComponent extends BaseDetailComponent<Product> {
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
    description: new FormControl<string>('', {
      nonNullable: true,
    }),
    enabled: new FormControl<boolean>(true, {
      nonNullable: true,
    }),
    price: new FormControl<Maybe<number>>(null),
  });
  public assetChanges: SelectedAssets = {};

  public get assetsChanged(): boolean {
    return !!Object.values(this.assetChanges).length;
  }

  constructor(private dataService: ProductDataService) {
    super();
    this.init();
  }

  protected setFormValues(entity: Product): void {
    this.detailForm.patchValue(entity);
  }

  public save(): void {
    this.entity$
      .pipe(
        take(1),
        mergeMap((product: Product) => {
          const payload = {
            ...product,
            assetIds: this.assetChanges.assets?.map((a) => a.id),
            featuredAssetId: this.assetChanges.featuredAsset?.id,
          };

          return this.dataService.updateProduct(payload);
        })
      )
      .subscribe();
  }
}
