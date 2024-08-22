import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { exhaustMap, map, mergeMap, Observable, take } from 'rxjs';

import {
  Category,
  ConfigurableOperation,
  ConfigurableOperationDefinition,
  ConfigurableOperationInput,
  encodeConfigArgValue,
} from '@mosaic/common';

import { BaseDetailComponent } from '../../asset/asset-list/base-detail.component';
import { CategoryDataService, CategoryFiltersResult } from '../../../data';
import { UpdateCategoryInput } from '../../../data';

interface ProductForm {
  name: FormControl<string>;
  slug: FormControl<string>;
  description: FormControl<string>;
  isPrivate: FormControl<boolean>;
  filters: FormArray<any>;
}

const mapOperationsToInputs = (
  operations: ConfigurableOperation[]
): ConfigurableOperationInput[] =>
  operations.map((filter) => ({
    code: filter.code,
    arguments: Object.entries(filter.args).map(([name, value]) => ({
      name,
      value: encodeConfigArgValue(value),
    })),
  }));

@Component({
  selector: 'mos-category-item',
  templateUrl: './category-item.component.html',
  styles: ['.mos-button-md {--mos-icon-size: 1.25rem}'],
})
export class CategoryItemComponent extends BaseDetailComponent<Category> {
  private filtersMap: WeakMap<
    AbstractControl,
    ConfigurableOperationDefinition
  > = new WeakMap();

  public allFilters$: Observable<ConfigurableOperationDefinition[]> =
    this.dataService
      .getCategoryFilters()
      .single$.pipe(
        map(({ categoryFilters }: CategoryFiltersResult) => categoryFilters)
      );
  public detailForm: FormGroup<ProductForm> = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    isPrivate: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
    slug: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
    }),
    filters: new FormArray<any>([]),
  });

  public get filters(): FormArray {
    return this.detailForm.controls.filters;
  }

  constructor(private dataService: CategoryDataService) {
    super();

    this.init();
  }

  public getFilterDefinition(
    control: AbstractControl
  ): ConfigurableOperationDefinition | undefined {
    return this.filtersMap.has(control)
      ? this.filtersMap.get(control)
      : undefined;
  }

  public addFilter(collectionFilter: ConfigurableOperationDefinition) {
    const argsHash = collectionFilter.args.reduce(
      (output, arg) => ({
        ...output,
        //[arg.name]: getConfigArgValue(arg.value),
      }),
      {}
    );

    const control = new FormControl({
      code: collectionFilter.code,
      args: argsHash,
    });

    this.filters.push(control);
    this.filtersMap.set(control, collectionFilter);
  }

  public save() {
    this.entity$
      .pipe(
        take(1),
        exhaustMap((category) => {
          console.log('__SAVE');

          const input = this.getUpdatedCategory(
            category
          ) as UpdateCategoryInput;

          return this.dataService.updateCategory(input);
        })
      )
      .subscribe
      // () => {
      //   this.assetChanges = {};
      //   this.detailForm.markAsPristine();
      //   this.changeDetector.markForCheck();
      //   this.notificationService.success(_('common.notify-update-success'), {
      //     entity: 'Collection',
      //   });
      //   this.contentsComponent.refresh();
      // },
      // (err) => {
      //   this.notificationService.error(_('common.notify-update-error'), {
      //     entity: 'Collection',
      //   });
      // }
      ();
  }

  protected setFormValues(entity: Category): void {
    this.detailForm.patchValue(entity);
  }

  private getUpdatedCategory(category: Category): UpdateCategoryInput {
    return {
      ...category,
      ...this.detailForm.value,

      filters: mapOperationsToInputs(this.detailForm.value.filters),
    };
  }
}
