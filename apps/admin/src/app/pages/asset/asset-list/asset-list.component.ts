import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Asset } from '@mosaic/common';

import { AssetDataService } from '../asset.service';
import { BaseListComponent, Paginated } from '../../../common/base-list';

@Component({
  selector: 'mos-asset-list',
  templateUrl: './asset-list.component.html',
})
export class AssetListComponent
  extends BaseListComponent<Asset>
  implements OnInit
{
  constructor(
    activateRoute: ActivatedRoute,
    private dataService: AssetDataService
  ) {
    super(activateRoute);
    super.setQueryFn(
      (args: any) => this.dataService.getAssets(args),
      (data: { assets: Paginated<Asset> }): Paginated<Asset> => data.assets
    );
  }

  public onFileDrop(fileList: FileList): void {
    const files: File[] = Array.from(fileList || []);

    this.dataService.createAssets(files.map((file) => ({ file }))).subscribe();
  }
}
