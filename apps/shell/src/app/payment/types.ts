import { Observable } from 'rxjs';

export interface PaymentHandler {
  code: string;
  handle: () => Observable<any>;
}
