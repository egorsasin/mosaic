import { Observable, lastValueFrom } from 'rxjs';

/**
 * Identity function which asserts to the type system that a promise which can resolve to T or undefined
 * does in fact resolve to T.
 * Used when performing a "find" operation on an entity which we are sure exists, as in the case that we
 * just successfully created or updated it.
 */
export function assertFound<T>(
  promise: Promise<T | undefined | null>
): Promise<T> {
  return promise as Promise<T>;
}

export async function awaitPromiseOrObservable<T>(
  value: T | Promise<T> | Observable<T>
): Promise<T> {
  let result = await value;
  if (result instanceof Observable) {
    result = await lastValueFrom(result);
  }
  return result;
}

export function normalizeEmailAddress(input: string): string {
  return isEmailAddressLike(input) ? input.trim().toLowerCase() : input.trim();
}

export function isEmailAddressLike(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}
