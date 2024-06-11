import { HistoryEntryType } from '@mosaic/common';

import { HistoryEntry } from '../../data';
import { MosaicEntityEvent } from '../entity-event';
import { RequestContext } from '../../api/common';

type HistoryInput =
  | {
      type: HistoryEntryType;
      data?: unknown;
    }
  | number;

/**
 * @description
 * This event is fired whenever one {@link HistoryEntry} is added, updated or deleted.
 */
export class HistoryEntryEvent extends MosaicEntityEvent<
  HistoryEntry,
  HistoryInput
> {
  public readonly historyType: 'order' | 'customer' | string;

  constructor(
    ctx: RequestContext,
    entity: HistoryEntry,
    type: 'created' | 'updated' | 'deleted',
    historyType: 'order' | 'customer' | string,
    input?: HistoryInput
  ) {
    super(entity, type, ctx, input);
    this.historyType = historyType;
  }
}
