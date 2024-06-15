import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';

import { MosDialogService } from '@mosaic/ui/dialog';
import { ContextWrapper } from '@mosaic/cdk';
import { Asset, unique } from '@mosaic/common';

import { MosAssetPickerDialogComponent } from '../asset-picker-dialog';

export interface AssetChange {
  assets: Asset[];
  featuredAsset: Asset | undefined;
}

/**
 * A component which displays the Assets, and allows assets to be removed and
 * added, and for the featured asset to be set.
 *
 * Note: rather complex code for drag drop is due to a limitation of the default CDK implementation
 * which is addressed by a work-around from here: https://github.com/angular/components/issues/13372#issuecomment-483998378
 */
@Component({
  selector: 'mos-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosAssetsComponent {
  @Input() featuredAsset: Asset | undefined;
  @HostBinding('class.compact')
  @Input()
  compact = false;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<AssetChange>();

  private assetsInternal: Asset[] = [];

  @Input() set assets(val: Asset[]) {
    this.assetsInternal = (val || []).slice();
  }

  public get assets(): Asset[] {
    return this.assetsInternal;
  }

  constructor(
    private dialogService: MosDialogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  public selectAssets(): void {
    this.dialogService
      .open<Asset[]>(new ContextWrapper(MosAssetPickerDialogComponent), {
        label: 'Assets',
      })
      .subscribe((result: Asset[]) => {
        if (result?.length) {
          this.assetsInternal = unique(
            this.assetsInternal.concat(result),
            'id'
          );
          if (!this.featuredAsset) {
            this.featuredAsset = result[0];
          }

          this.emitChangeEvent(this.assetsInternal, this.featuredAsset);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public setAsFeatured(asset: Asset): void {
    this.featuredAsset = asset;
    this.emitChangeEvent(this.assets, asset);
  }

  public isFeatured(asset: Asset): boolean {
    return !!this.featuredAsset && this.featuredAsset.id === asset.id;
  }

  public removeAsset(asset: Asset): void {
    this.assets = this.assets.filter((a) => a.id !== asset.id);
    if (this.featuredAsset && this.featuredAsset.id === asset.id) {
      this.featuredAsset = this.assets.length > 0 ? this.assets[0] : undefined;
    }
    this.emitChangeEvent(this.assets, this.featuredAsset);
  }

  private emitChangeEvent(
    assets: Asset[],
    featuredAsset: Asset | undefined
  ): void {
    this.change.emit({
      assets,
      featuredAsset,
    });
  }

  public dropListDropped(event: CdkDragDrop<number>): void {
    moveItemInArray(
      this.assets,
      event.previousContainer.data,
      event.container.data
    );
    this.emitChangeEvent(this.assets, this.featuredAsset);
  }
}
