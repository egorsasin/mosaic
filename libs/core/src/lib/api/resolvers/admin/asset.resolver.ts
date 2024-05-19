import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';

import {
  CreateAssetInput,
  CreateAssetResult,
  PaginatedList,
  PayloadArgs,
  QueryListArgs,
} from '../../../types';
import { AssetService } from '../../../service/services';
import { Asset } from '../../../data';

@Resolver()
export class AssetResolver {
  constructor(private assetService: AssetService) {}

  @Query()
  async assets(@Args() args: QueryListArgs): Promise<PaginatedList<Asset>> {
    return this.assetService.findAll(args.options);
  }

  @Mutation()
  public async createAssets(
    @Args() args: PayloadArgs<CreateAssetInput[]>
  ): Promise<CreateAssetResult[]> {
    const assets: CreateAssetResult[] = [];

    for (const input of args.input) {
      const asset = await this.assetService.create(input);
      assets.push(asset);
    }

    return assets;
  }
}
