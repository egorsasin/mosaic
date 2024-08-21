import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormArray,
  Validators,
} from '@angular/forms';
import { map, Observable } from 'rxjs';

import {
  Asset,
  ConfigurableOperationDefinition,
  Product,
} from '@mosaic/common';

import { BaseDetailComponent } from '../../asset/asset-list/base-detail.component';
import { CategoryDataService, CategoryFiltersResult } from '../../../data';

interface ProductForm {
  name: FormControl<string>;
  slug: FormControl<string>;
  isPrivate: FormControl<boolean>;
  filters: FormArray<any>;
}

@Component({
  selector: 'mos-category-item',
  templateUrl: './category-item.component.html',
  styles: ['.mos-button-md {--mos-icon-size: 1.25rem}'],
})
export class CategoryItemComponent extends BaseDetailComponent<Product> {
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
    console.log('__FILTERS', this.filters);

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

    console.log('__FILTERS', this.filters);
  }

  protected setFormValues(entity: Product): void {
    this.detailForm.patchValue(entity);
  }
}
