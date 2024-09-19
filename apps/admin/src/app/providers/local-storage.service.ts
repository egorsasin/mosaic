import { Injectable } from '@angular/core';

const PREFIX = 'msc_';

export type LocalStorageTypeMap = {
  authToken: string;
};

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  public get<K extends keyof LocalStorageTypeMap>(
    key: K
  ): LocalStorageTypeMap[K] | null {
    const keyName = this.keyName(key);
    const item =
      sessionStorage.getItem(keyName) || localStorage.getItem(keyName);
    let result: LocalStorageTypeMap[K] | null = null;

    try {
      result = JSON.parse(item || 'null');
    } catch (e) {
      console.error(
        `Could not parse the localStorage value for "${key}" (${item})`
      );
    }

    return result;
  }

  public remove(key: keyof LocalStorageTypeMap): void {
    const keyName = this.keyName(key);

    sessionStorage.removeItem(keyName);
    localStorage.removeItem(keyName);
  }

  public set<K extends keyof LocalStorageTypeMap>(
    key: K,
    value: LocalStorageTypeMap[K]
  ): void {
    const keyName = this.keyName(key);

    localStorage.setItem(keyName, JSON.stringify(value));
  }

  private keyName(key: string): string {
    return `${PREFIX}${key}`;
  }
}
