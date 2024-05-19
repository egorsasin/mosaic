import { inject } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import {
  EMPTY,
  Observable,
  Subject,
  filter,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { notNullOrUndefined } from '@mosaic/common';
import { UntypedFormGroup } from '@angular/forms';

interface MosaicEntity {
  id: number;
  updatedAt?: string;
}

export abstract class BaseDetailComponent<Entity extends MosaicEntity> {
  public entity$: Observable<Entity> = EMPTY;
  public id?: number;
  abstract detailForm: UntypedFormGroup;

  protected destroy$ = new Subject<void>();
  protected readonly route = inject(ActivatedRoute);

  public init(): void {
    this.entity$ = this.route.data.pipe(
      switchMap((data: Data) => {
        const { detail } = data;
        return (detail.entity as Observable<Entity>).pipe(
          takeUntil(this.destroy$)
        );
      }),
      filter(notNullOrUndefined),
      tap((entity) => (this.id = entity.id)),
      shareReplay(1)
    );

    this.setUpStreams();
  }

  protected abstract setFormValues(entity: Entity): void;

  protected setUpStreams() {
    this.entity$.pipe(takeUntil(this.destroy$)).subscribe((entity: Entity) => {
      if (entity) {
        this.setFormValues(entity);
      }
      this.detailForm.markAsPristine();
    });
  }
}
