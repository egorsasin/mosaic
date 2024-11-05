import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';

import { DeleteAssetsInput, MutationArgs, PaginatedList } from '@mosaic/common';

import {
  CreateAssetInput,
  CreateAssetResult,
  PayloadArgs,
  QueryListArgs,
} from '../../../types';
import { AssetService } from '../../../service/services/asset.service';
import { Asset } from '../../../data';
import { Permission, RequestContext } from '../../common';
import { Allow, Ctx } from '../../decorators';

@Resolver()
export class AssetResolver {
  constructor(private assetService: AssetService) {}

  @Query()
  @Allow(Permission.Authenticated)
  async assets(@Args() args: QueryListArgs): Promise<PaginatedList<Asset>> {
    return this.assetService.findAll(args.options);
  }

  @Mutation()
  @Allow(Permission.Authenticated)
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

  @Mutation()
  @Allow(Permission.Authenticated)
  async deleteAssets(
    @Ctx() ctx: RequestContext,
    @Args()
    { input: { ids, force } }: MutationArgs<DeleteAssetsInput>
  ) {
    return this.assetService.delete(ctx, ids, force || undefined);
  }
}
