import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Asset, Product } from '../../../data';
import { AssetService } from '../../../service/services';

@Resolver(Product)
export class ProductEntityResolver {
  constructor(private assetService: AssetService) {}

  @ResolveField()
  async featuredAsset(@Parent() product: Product): Promise<Asset | undefined> {
    if (product.featuredAsset) {
      return product.featuredAsset;
    }
    return this.assetService.getFeaturedAsset(product);
  }

  @ResolveField()
  async assets(@Parent() product: Product): Promise<Asset[] | undefined> {
    return this.assetService.getEntityAssets(product);
  }
}
