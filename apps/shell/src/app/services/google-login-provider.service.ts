import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleLoginProvider {
  public credentials: Subject<string> = new Subject<string>();
  readonly state: Promise<void>;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.state = this.loadScript().then(() => {
      google.accounts.id.initialize({
        client_id:
          '1061023759206-vqvro3vr2m3anmp1sai0npa46sc501dc.apps.googleusercontent.com',
        context: 'signin',
        callback: ({ credential }: { credential: string }) => {
          this.credentials.next(credential);
        },
      });
    });
  }

  public loadScript(): Promise<void> {
    const script = this.document.createElement('script');

    script.async = true;
    script.defer = true;
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-auth';

    this.document.head.appendChild(script);

    return this.assignScriptLoadingPromise(script);
  }

  private assignScriptLoadingPromise(script: HTMLScriptElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject();
    });
  }
}
