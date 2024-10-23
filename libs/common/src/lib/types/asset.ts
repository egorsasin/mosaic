import { DeletionResult } from './common';

export interface FocalPoint {
  x: number;
  y: number;
}

export interface Asset {
  id: number;
  preview: string;
  focalPoint: FocalPoint;
}

export type DeleteAssetInput = {
  id: number;
  force?: boolean;
};

export type DeleteAssetsInput = {
  ids: number[];
  force?: boolean;
};

export type DeletionResponse = {
  __typename?: 'DeletionResponse';
  result: DeletionResult;
  message?: string | null;
};
