import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'assetPreview',
})
export class MosAssetPreviewPipe implements PipeTransform {
  transform(asset?: any, preset: string | number = 'thumb'): string {
    if (!asset) {
      return '';
    }
    if (asset.preview == null || typeof asset.preview !== 'string') {
      throw new Error(`Expected an Asset, got ${JSON.stringify(asset)}`);
    }
    const fp = asset.focalPoint
      ? `&fpx=${asset.focalPoint.x}&fpy=${asset.focalPoint.y}`
      : '';

    return Number.isNaN(Number(preset))
      ? `${asset.preview}?preset=${preset}${fp}`
      : `${asset.preview}?w=${preset}&h=${preset}${fp}`;
  }
}
