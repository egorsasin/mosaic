import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { DataService } from '../../../data';

import { CREATE_ADDRESS } from './address.definitions';
import {
  CreateAddressInput,
  CreateAddressMutation,
  CreateAddressMutationVariables,
} from './address.types';
import { debounceTime, switchMap } from 'rxjs';

interface CitySuggestion {
  city: string;
}

export type ControlsOf<T> = {
  [K in keyof T]: T[K] extends Record<string, K>
    ? FormGroup<ControlsOf<T[K]>>
    : FormControl<T[K]>;
};

@Component({
  selector: 'mos-address',
  templateUrl: './address.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MosAddressComponent {
  public form = new FormGroup<ControlsOf<CreateAddressInput>>({
    city: new FormControl('', { nonNullable: true }),
    default: new FormControl(true, { nonNullable: true }),
  });

  public citySuggestions = this.form.controls.city.valueChanges.pipe(
    debounceTime(300),
    switchMap((city: string | null) => {
      const url = `https://address-autocomplete-pl-stage.placematic.pl/1.0/suggest/city?query=${city}&outputSchema=basic&apiKey=0732ea8f-0a39-4daf-99da-97d24a26518f`;
      return this.httpClient.get<CitySuggestion[]>(url);
    })
  );

  constructor(
    private dataService: DataService,
    private httpClient: HttpClient
  ) {}

  public onSubmit() {
    const formValue = this.form.value as CreateAddressInput;
    this.save(formValue);
  }

  private save(value: CreateAddressInput) {
    this.dataService
      .mutate<CreateAddressMutation, CreateAddressMutationVariables>(
        CREATE_ADDRESS,
        {
          input: value,
        }
      )
      .subscribe((data) => {
        console.log(data);
      });
  }
}
