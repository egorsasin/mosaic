import { TemplateRef } from '@angular/core';

export type MosHandler<T, G> = (item: T) => G;

export type MosNotificationStatus =
  | 'error'
  | 'info'
  | 'neutral'
  | 'success'
  | 'warning';

export type MosAlertAutoClose =
  | MosHandler<MosNotificationStatus, number>
  | number;

export interface MosAlertOptions<I = undefined> {
  readonly autoClose: MosAlertAutoClose;
  readonly data: I;
  readonly closeable: boolean;
  readonly label: TemplateRef<MosAlertOptions<I>> | string;
}
