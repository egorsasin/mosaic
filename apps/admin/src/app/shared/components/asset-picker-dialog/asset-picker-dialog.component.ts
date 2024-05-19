import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Output,
} from '@angular/core';

import { MOSAIC_CONTEXT } from '@mosaic/cdk';

import { AssetDataService } from '../../../pages/asset/asset.service';
import { Observable, map, tap } from 'rxjs';
import { SelectionManager } from './selection-manager';
import { Asset } from '../../../common';

@Component({
  selector: 'mosaic-asset-picker-dialog',
  templateUrl: './asset-picker-dialog.component.html',
  styleUrls: ['./asset-picker-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AssetDataService],
})
export class MosAssetPickerDialogComponent {
  public readonly selectionManager = new SelectionManager<Asset>({
    multiSelect: true,
    itemsAreEqual: (curr: Asset, next: Asset) => curr.id === next.id,
    additiveMode: true,
  });
  public paginationConfig = {
    currentPage: 0,
    itemsPerPage: 25,
    totalPages: 1,
  };
  public items$: Observable<Asset[]>;

  private listQuery = this.dataService.getAssets({
    take: this.paginationConfig.itemsPerPage,
  });

  public get selection(): Asset[] {
    return this.selectionManager.selection;
  }

  constructor(
    @Inject(MOSAIC_CONTEXT) public context: any,
    private dataService: AssetDataService
  ) {
    this.items$ = this.listQuery.stream$.pipe(
      tap(
        ({ assets }: any) =>
          (this.paginationConfig.totalPages = Math.ceil(
            assets.totalItems / this.paginationConfig.itemsPerPage
          ))
      ),
      map((result: any) => result.assets.items)
    );
  }

  public isSelected(asset: Asset): boolean {
    return this.selectionManager.isSelected(asset);
  }

  public toggleSelection(asset: Asset, event?: MouseEvent) {
    this.selectionManager.toggleSelection(asset, event);
  }

  public cancel(): void {
    this.context.completeWith(null);
  }

  public select(): void {
    this.context.completeWith(this.selection);
  }
}
