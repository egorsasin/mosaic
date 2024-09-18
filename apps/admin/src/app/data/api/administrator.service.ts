import { Injectable } from '@angular/core';

import { GetActiveAdministratorQuery } from '../models';
import { GET_ACTIVE_ADMINISTRATOR } from '../definitions';
import { BaseDataService } from './base-data.service';

@Injectable()
export class AdministratorDataService {
  constructor(private baseDataService: BaseDataService) {}

  public getActiveAdministrator() {
    return this.baseDataService.query<GetActiveAdministratorQuery>(
      GET_ACTIVE_ADMINISTRATOR,
      {}
    );
  }
}
