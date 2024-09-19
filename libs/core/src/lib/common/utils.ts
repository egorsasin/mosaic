import { AssetType } from './types';

export function getAssetType(mimeType: string): AssetType {
  const type = mimeType.split('/')[0];

  switch (type) {
    case 'image':
      return AssetType.IMAGE;
    case 'video':
      return AssetType.VIDEO;
    default:
      return AssetType.BINARY;
  }
}

export function isEmailAddressLike(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

export function normalizeEmailAddress(input: string): string {
  return isEmailAddressLike(input) ? input.trim().toLowerCase() : input.trim();
}
