import { Injectable } from '@angular/core';

import { BaseDataService } from '../../data';
import { PRODUCT_LIST_QUERY } from './product-list';
import { UPDATE_PRODUCT } from './product-item/product-item.graphql';
import { Observable } from 'rxjs';

@Injectable()
export class ProductDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getProducts(options: any) {
    return this.baseDataService.query<any, any>(PRODUCT_LIST_QUERY, {
      options,
    }) as any;
  }

  public updateProduct(product: any): Observable<any> {
    const { id, enabled, slug, description, assetIds, featuredAssetId } =
      product;
    const input = {
      id,
      input: { enabled, slug, description, assetIds, featuredAssetId },
    };

    return this.baseDataService.mutate<any, any>(UPDATE_PRODUCT, input);
  }
}
