import { DeleteAssetInput } from '@mosaic/common';

import { RequestContext } from '../../api';
import { Asset } from '../../data';
import { MosaicEntityEvent } from '../entity-event';

type AssetInputTypes = DeleteAssetInput | number;

export class AssetEvent extends MosaicEntityEvent<Asset, AssetInputTypes> {
  constructor(
    ctx: RequestContext,
    entity: Asset,
    type: 'created' | 'updated' | 'deleted',
    input?: AssetInputTypes
  ) {
    super(entity, type, ctx, input);
  }

  public get asset(): Asset {
    return this.entity;
  }
}
