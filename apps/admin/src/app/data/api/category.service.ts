import { Injectable } from '@angular/core';

import { BaseDataService } from '../../base-data.service';

@Injectable()
export class CategoryDataService {
  constructor(private baseDataService: BaseDataService) {}
}
