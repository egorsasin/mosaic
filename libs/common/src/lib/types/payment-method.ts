import {
  ConfigArg,
  ConfigurableOperationInput,
} from './configurable-operation';

export type CreatePaymentMethodInput = {
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  handler: ConfigurableOperationInput;
};

export type CreatePaymentMethodMutation = {
  createPaymentMethod: {
    id: string;
    name: string;
    code: string;
    description: string;
    enabled: boolean;
    handler: {
      code: string;
      args: ConfigArg[];
    };
  };
};

export type PaymentMethodQuote = {
  code: string;
  customFields?: string;
  description: string;
  eligibilityMessage?: string;
  id: number;
  isEligible: boolean;
  name: string;
};
