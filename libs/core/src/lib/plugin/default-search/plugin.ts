import { OnApplicationBootstrap, Type } from '@nestjs/common';

import { EventBus, ProductEvent } from '../../event-bus';
import { MosaicPlugin } from '../mosaic-plugin';
import { PluginCommonModule } from '../plugin-common.module';
import { SearchIndex } from './entities';
import { ShopFulltextSearchResolver } from './api';
import { FulltextSearchService } from './providers';

@MosaicPlugin({
  imports: [PluginCommonModule],
  providers: [FulltextSearchService],
  entities: [SearchIndex],
  adminApiExtensions: {
    resolvers: [],
  },
  shopApiExtensions: {
    resolvers: [ShopFulltextSearchResolver],
  },
})
export class DefaultSearchPlugin implements OnApplicationBootstrap {
  constructor(private eventBus: EventBus) {
    this.eventBus.ofType(ProductEvent).subscribe((event) => {
      if (event.type === 'deleted') {
        //return this.searchIndexService.deleteProduct(event.ctx, event.entity);
      } else {
        //return this.searchIndexService.updateProduct(event.ctx, event.entity);
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
