import { Product } from '../../../data';
import { RequestContext } from '../../../api';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EMPTY } from 'rxjs';

@Injectable()
export class SearchIndexService implements OnApplicationBootstrap {
  public onApplicationBootstrap(): void {
    throw new Error('Method not implemented.');
  }

  public updateProduct(ctx: RequestContext, product: Product) {
    return EMPTY;
  }

  deleteProduct(ctx: RequestContext, product: Product) {
    return EMPTY;
  }
}
