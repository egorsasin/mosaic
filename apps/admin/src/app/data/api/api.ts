import { BaseDataService } from './base-data.service';
import { CategoryDataService } from './category.service';
import { PaymentMethodDataService } from './payment-method.service';
import { ProductDataService } from './product.service';

export const APIS = [
  BaseDataService,
  CategoryDataService,
  ProductDataService,
  PaymentMethodDataService,
];
