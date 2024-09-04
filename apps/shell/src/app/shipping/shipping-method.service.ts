import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ShippingMethodService {
  private metadataCache = new BehaviorSubject<{ [code: string]: unknown }>({});

  public metadata = this.metadataCache.asObservable();

  public setMetadata(key: string, value: unknown) {
    const currentValue = this.metadataCache.getValue();

    this.metadataCache.next({ ...currentValue, [key]: value });
  }
}
