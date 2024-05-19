export type IdentityMatcher<I> = (previous: I, next: I) => boolean;

export type StringHandler<T> = (item: T) => string;

export interface DataListHost<T> {
  handleOption(option?: T): void;
  updateOpen(open: boolean): void;
  readonly identityMatcher?: IdentityMatcher<T>;
}

export type MosPoint = { top: number; left: number };

export abstract class PositionAccessor {
  public abstract getPosition(rect: DOMRect): MosPoint;
}

export abstract class ClientRectAccessor {
  public abstract getClientRect(): DOMRect;
}
