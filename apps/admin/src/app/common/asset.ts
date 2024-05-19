export interface FocalPoint {
  x: number;
  y: number;
}

export interface Asset {
  id: number;
  preview: string;
  focalPoint: FocalPoint;
}
