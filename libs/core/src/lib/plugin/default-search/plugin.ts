import { OnApplicationBootstrap, Type } from '@nestjs/common';

import { EventBus, ProductEvent } from '../../event-bus';
import { MosaicPlugin } from '../mosaic-plugin';
import { PluginCommonModule } from '../plugin-common.module';
import { SearchIndex } from './entities';
import { ShopFulltextSearchResolver } from './api';
import { FullTextSearchService } from './providers';
import { SearchIndexService } from './indexer';

@MosaicPlugin({
  imports: [PluginCommonModule],
  providers: [FullTextSearchService, SearchIndexService],
  entities: [SearchIndex],
  adminApiExtensions: {
    resolvers: [],
  },
  shopApiExtensions: {
    resolvers: [ShopFulltextSearchResolver],
  },
})
export class DefaultSearchPlugin implements OnApplicationBootstrap {
  constructor(
    private eventBus: EventBus,
    searchIndexService: SearchIndexService
  ) {
    this.eventBus.ofType(ProductEvent).subscribe((event) => {
      if (event.type === 'deleted') {
        return searchIndexService.deleteProduct(event.ctx, event.entity);
      } else {
        return searchIndexService.updateProduct(event.ctx, event.entity);
      }
    });
  }

  public static init(): Type<DefaultSearchPlugin> {
    return DefaultSearchPlugin;
  }

  public onApplicationBootstrap(): void {
    // TODO
  }
}
