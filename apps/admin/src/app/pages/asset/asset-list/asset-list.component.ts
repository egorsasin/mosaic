import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Asset, PaginatedList } from '@mosaic/common';

import { AssetDataService } from '../asset.service';
import { BaseListComponent } from '../../../common/base-list';

@Component({
  selector: 'mos-asset-list',
  templateUrl: './asset-list.component.html',
})
export class AssetListComponent
  extends BaseListComponent<any, Asset>
  implements OnInit
{
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

  public onFileDrop(fileList: FileList): void {
    const files: File[] = Array.from(fileList || []);

    this.dataService.createAssets(files.map((file) => ({ file }))).subscribe();
  }
}
