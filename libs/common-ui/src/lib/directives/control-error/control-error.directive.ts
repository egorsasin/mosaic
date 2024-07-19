//#region libraries import
import {
  Directive,
  OnDestroy,
  ViewContainerRef,
  ComponentRef,
  Self,
  InjectionToken,
  Inject,
  Optional,
  OnInit,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import {
  distinctUntilChanged,
  EMPTY,
  merge,
  NEVER,
  Observable,
  Subject,
} from 'rxjs';

import { ControlErrorComponent } from './control-error.component';
import { FormActionDirective } from './form-error.directive';

export class ErrorService {
  public get errors(): { [key: string]: any } {
    return {};
  }
}

export const FORM_ERRORS = new InjectionToken<ErrorService>('FORM_ERRORS', {
  factory: () => {
    return new ErrorService();
  },
});

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formControl], [formControlName]:not(.error-control)',
})
export class ControlErrorDirective implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  private submit$: Observable<Event | null> = NEVER;
  private reset$: Observable<Event>;

  public componentRef?: ComponentRef<ControlErrorComponent>;

  constructor(
    @Self() private ngControl: NgControl,
    @Inject(FORM_ERRORS) private errorService: ErrorService,
    @Optional() private form: FormActionDirective,
    private viewContainerRef: ViewContainerRef
  ) {
    this.submit$ = this.form ? this.form.submit$ : EMPTY;
    this.reset$ = this.form ? this.form.reset$ : EMPTY;
  }

  public ngOnInit(): void {
    const submit$: Observable<boolean> = merge(
      this.submit$.pipe(map(() => true)),
      this.reset$.pipe(
        tap(() => this.hideError()),
        map(() => false)
      )
    ).pipe(filter((submit: boolean) => !!submit));

    const changes$ = this.ngControl.valueChanges?.pipe(
      filter((changes: unknown) => !!changes)
    );

    const status$ =
      this.ngControl.statusChanges?.pipe(distinctUntilChanged()) || EMPTY;

    merge([status$, changes$, submit$])
      ?.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const controlErrors = this.ngControl.errors;
        const formErrors = this.errorService.errors;

        if (controlErrors) {
          const firstKey = Object.keys(controlErrors)[0];
          const getError = formErrors[firstKey];
          const text = getError ? getError(controlErrors[firstKey]) : null;

          this.setError(text);
        } else {
          if (this.componentRef) {
            this.hideError();
          }
        }
      });
  }

  public setError(text: string | null): void {
    if (!text) {
      this.componentRef && this.componentRef.destroy();
      return;
    }
    if (!this.componentRef) {
      this.componentRef = this.viewContainerRef.createComponent(
        ControlErrorComponent
      );
    }
    this.componentRef.instance.error = text;
  }

  public hideError(): void {
    this.setError(null);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
