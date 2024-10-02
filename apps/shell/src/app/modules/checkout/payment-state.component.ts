import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStateComponent {
  constructor(router: Router) {
    inject(ActivatedRoute).data.subscribe((data) => {
      const orderCode = data['orderCode'];
      const url = orderCode ? `/order/${orderCode}` : '/';

      router.navigateByUrl(url, {
        state: {
          isCheckout: true,
        },
        replaceUrl: true,
      });
    });
  }
}
