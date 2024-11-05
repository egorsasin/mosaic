import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  Optional,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

import { MOSAIC_CONTEXT } from '@mosaic/cdk';
import { MosIconComponent } from '@mosaic/ui/svg-icon';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MosIconComponent],
  template: `
    <div class="flex flex-col items-center mos-text-sm text-slate-700 px-6">
      <div class="font-medium mb-4">Produkt dodany do koszyka</div>
      <a
        routerLink="/checkout"
        class="rounded-sm border border-slate-700 ring-slate-700 px-3 py-1 hover:bg-slate-700 hover:text-white inline-flex items-center gap-x-1 duration-300 transition-all cursor-pointer"
      >
        Złóż zamówienie
      </a>
      <button
        class="mt-5 text-slate-700 border-none outline-none hover:underline"
        (click)="context?.$implicit.complete()"
      >
        Kontynuuj zakupy
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToCardNotificationComponent {
  constructor(@Optional() @Inject(MOSAIC_CONTEXT) public context: any) {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => context?.$implicit.complete());
  }
}
