import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { ContextWrapper } from '@mosaic/cdk';
import { Subject, takeUntil } from 'rxjs';
import { SHIPPING_METHOD_HANDLER, ShippingHandler } from './types';

@Component({
  selector: 'mos-shipping-method',
  template: `
    <div (click)="click()"><ng-content> </ng-content></div>
    <div
      *ngIf="isActive && component"
      class="w-full"
      style="border-radius: inherit"
    >
      <ng-container
        *mosComponentOutlet="component; context: shippingHandler"
      ></ng-container>
    </div>
  `,
  styles: [''],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingMethodComponent<T> implements OnInit, OnDestroy {
  protected shippingHandler?: ShippingHandler<T>;
  protected destroy$: Subject<void> = new Subject<void>();

  @Input({ required: true }) public code = '';

  @Input() public isActive = false;

  @Output() public selelectMethod = new EventEmitter<Record<string, unknown>>();

  public click(): void {
    if (!this.isActive) {
      this.selectShippingMethod();
    }
  }

  public selectShippingMethod(skipCache = true): void {
    if (this.shippingHandler?.select) {
      this.shippingHandler
        .select(skipCache)
        .pipe(takeUntil(this.destroy$))
        .subscribe((metadata: Record<string, unknown>) =>
          this.selelectMethod.emit(metadata)
        );
    } else {
      this.selelectMethod.emit(undefined);
    }
  }

  public get component(): ContextWrapper<T> | undefined {
    const customComponent = this.shippingHandler?.component;

    return customComponent
      ? new ContextWrapper(customComponent, this.injector)
      : undefined;
  }

  constructor(
    @Inject(SHIPPING_METHOD_HANDLER)
    private shippingHandlers: ShippingHandler[],
    private injector: Injector
  ) {}

  public ngOnInit(): void {
    const shippingHandler = this.shippingHandlers.find(
      (shippingHandler: ShippingHandler) => shippingHandler.code === this.code
    );

    this.shippingHandler = shippingHandler as ShippingHandler<T>;
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
