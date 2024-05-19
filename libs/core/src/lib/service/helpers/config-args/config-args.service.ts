import { Injectable } from '@nestjs/common';
import { UserInputError } from '@nestjs/apollo';

import { ConfigurableOperationInput } from '@mosaic/common';

import { ConfigService, PaymentMethodHandler } from '../../../config';
import { ConfigArg, ConfigurableOperation } from '../../../types';
import { ConfigurableOperationDef } from '../../../common';

export type ConfigDefTypeMap = {
  PaymentMethodHandler: PaymentMethodHandler;
};

export type ConfigDefType = keyof ConfigDefTypeMap;

@Injectable()
export class ConfigArgService {
  private readonly definitionsByType: {
    [K in ConfigDefType]: Array<ConfigDefTypeMap[K]>;
  };

  constructor(private configService: ConfigService) {
    this.definitionsByType = {
      PaymentMethodHandler:
        this.configService.paymentOptions.paymentMethodHandlers,
    };
  }

  public getDefinitions<T extends ConfigDefType>(
    defType: T
  ): Array<ConfigDefTypeMap[T]> {
    return this.definitionsByType[defType] as Array<ConfigDefTypeMap[T]>;
  }

  /**
   * Parses and validates the input to a ConfigurableOperation.
   */
  public parseInput(
    defType: ConfigDefType,
    input: ConfigurableOperationInput
  ): ConfigurableOperation {
    const match = this.getByCode(defType, input.code);
    this.validateRequiredFields(input, match);
    const orderedArgs = this.orderArgsToMatchDef(match, input.arguments);

    return {
      code: input.code,
      args: orderedArgs,
    };
  }

  private getByCode<T extends ConfigDefType>(
    defType: T,
    code: string
  ): ConfigDefTypeMap[T] {
    const defsOfType = this.getDefinitions(defType);
    const match = defsOfType.find((def) => def.code === code);

    if (!match) {
      throw new UserInputError(
        'ERROR.NO_CONFIGURABLE_OPERATION_DEF_WITH_CODE_FOUND'
      );
    }

    return match;
  }

  private orderArgsToMatchDef<T extends ConfigDefType>(
    def: ConfigDefTypeMap[T],
    args: ConfigArg[]
  ) {
    const output: ConfigArg[] = [];
    for (const name of Object.keys(def.args)) {
      const match = args.find((arg) => arg.name === name);
      if (match) {
        output.push(match);
      }
    }
    return output;
  }

  private validateRequiredFields(
    input: ConfigurableOperationInput,
    def: ConfigurableOperationDef
  ): void {
    for (const [name, argDef] of Object.entries(def.args)) {
      if (argDef.required) {
        const inputArg = input.arguments.find((a) => a.name === name);

        let valid = false;
        try {
          valid = ['string', 'number', 'datetime'].includes(argDef.type)
            ? !!inputArg && inputArg.value !== '' && inputArg.value != null
            : !!inputArg && JSON.parse(inputArg.value) != null;
        } catch (e: unknown) {
          // ignore
        }

        if (!valid) {
          throw new UserInputError('ERROR.CONFIGURABLE_ARGUMENT_IS_REQUIRED');
        }
      }
    }
  }
}
