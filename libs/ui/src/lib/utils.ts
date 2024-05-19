import { IdentityMatcher, StringHandler } from './types';

export function getNativeFocused(documentRef: Document): Element | null {
  if (!documentRef.activeElement?.shadowRoot) {
    return documentRef.activeElement;
  }

  let element = documentRef.activeElement.shadowRoot.activeElement;

  while (element?.shadowRoot) {
    element = element.shadowRoot.activeElement;
  }

  return element;
}

function bothEmpty(prevItem: unknown, nextItem: unknown): boolean {
  return (
    Array.isArray(prevItem) &&
    Array.isArray(nextItem) &&
    !prevItem.length &&
    !nextItem.length
  );
}

export const defaultIdentityMatcher: IdentityMatcher<unknown> = (
  prevItem,
  nextItem
) => prevItem === nextItem || bothEmpty(prevItem, nextItem);

export const defaultStringHandler: StringHandler<unknown> = (item) =>
  String(item);
