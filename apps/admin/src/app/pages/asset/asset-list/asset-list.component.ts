import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Asset, PaginatedList } from '@mosaic/common';

import { BaseListComponent } from '../../../common/base-list';
import { SelectionManager } from '../../../shared/selection-manager';
import { AssetDataService } from '../../../data';

@Component({
  selector: 'mos-asset-list',
  templateUrl: './asset-list.component.html',
})
export class AssetListComponent
  extends BaseListComponent<any, Asset>
  implements OnInit
{
  public readonly selectionManager = new SelectionManager<Asset>({
    multiSelect: true,
    itemsAreEqual: (curr: Asset, next: Asset) => curr.id === next.id,
    additiveMode: true,
  });

  public get lastSelected(): Asset {
    return this.selectionManager.lastSelected();
  }

  constructor(
    activateRoute: ActivatedRoute,
    private dataService: AssetDataService
  ) {
    super(activateRoute);
    super.setQueryFn(
      (args: any) => this.dataService.getAssets(args),
      (data: { assets: PaginatedList<Asset> }): PaginatedList<Asset> =>
        data.assets
    );
  }

  public isSelected(asset: Asset): boolean {
    return this.selectionManager.isSelected(asset);
  }

  public onFileDrop(fileList: FileList): void {
    this.upload(fileList);
  }

  public uploadFile(event: any): void {
    this.upload(event.target.files);
  }

  public toggleSelection(asset: Asset, event?: MouseEvent) {
    this.selectionManager.toggleSelection(asset, event);
  }

  public deleteAssets(assets: Asset[]): void {
    const ids = assets.map((a) => a.id);

    this.dataService.deleteAssets(ids, true).subscribe(() => {
      this.selectionManager.clearSelection();
      this.refresh$.next();
    });
  }

  private upload(fileList: FileList): void {
    const files: File[] = Array.from(fileList || []);

    if (!files.length) {
      return;
    }

    this.dataService
      .createAssets(files.map((file) => ({ file })))
      .subscribe(() => this.refresh$.next());
  }
}
