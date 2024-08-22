import { OnApplicationBootstrap } from '@nestjs/common';

import { EventBus, ProductEvent } from '../../event-bus';
import { MosaicPlugin } from '../mosaic-plugin';
import { PluginCommonModule } from '../plugin-common.module';
import { SearchIndexItem } from './entities';

@MosaicPlugin({
  imports: [PluginCommonModule],
  providers: [],
  entities: [SearchIndexItem],
  adminApiExtensions: {
    resolvers: [],
  },
})
export class EmailPlugin implements OnApplicationBootstrap {
  constructor(private eventBus: EventBus) {
    this.eventBus.ofType(ProductEvent).subscribe((event) => {
      if (event.type === 'deleted') {
        //return this.searchIndexService.deleteProduct(event.ctx, event.entity);
      } else {
        //return this.searchIndexService.updateProduct(event.ctx, event.entity);
      }
    });
  }

  public onApplicationBootstrap(): void {
    throw new Error('Method not implemented.');
  }
}
