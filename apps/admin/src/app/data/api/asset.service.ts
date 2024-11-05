import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MutationArgs, SortOrder, DeleteAssetsInput } from '@mosaic/common';

import { CREATE_ASSETS, DELETE_ASSETS, GET_ASSET_LIST } from '../definitions';
import { DeleteAssetsMutation } from '../models';
import { BaseDataService } from './base-data.service';
import { QueryResult } from '../../common/query-result';

@Injectable()
export class AssetDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getAssets(options: any = {}) {
    const { skip = 0, take = 10 } = options;
    return this.baseDataService.query<any, any>(GET_ASSET_LIST, {
      skip,
      take,
      createdAt: SortOrder.DESC,
    }) as QueryResult<any>;
  }

  public createAssets(input: any): Observable<any> {
    return this.baseDataService.mutate<any, any>(CREATE_ASSETS, {
      input,
    }) as any;
  }

  public deleteAssets(
    ids: number[],
    force = false
  ): Observable<DeleteAssetsMutation> {
    return this.baseDataService.mutate<
      DeleteAssetsMutation,
      MutationArgs<DeleteAssetsInput>
    >(DELETE_ASSETS, {
      input: { ids, force },
    });
  }
}
