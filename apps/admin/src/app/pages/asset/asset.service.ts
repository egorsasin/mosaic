import { Injectable } from '@angular/core';

import { SortOrder } from '@mosaic/common';

import { BaseDataService } from '../../base-data.service';
import { CREATE_ASSETS, GET_ASSET_LIST } from './asset-list/asset-list.graphql';

@Injectable()
export class AssetDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getAssets(options: any = {}) {
    const { skip = 0, take = 10 } = options;
    return this.baseDataService.query<any, any>(GET_ASSET_LIST, {
      skip,
      take,
      createdAt: SortOrder.DESC,
    }) as any;
  }

  public createAssets(input: any) {
    return this.baseDataService.mutate<any, any>(CREATE_ASSETS, {
      input,
    }) as any;
  }
}
