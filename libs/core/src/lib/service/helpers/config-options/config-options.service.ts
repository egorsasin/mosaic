import { Injectable } from '@nestjs/common';

import { ConfigService } from '../../../config';
import { UserInputError } from '../../../common';
import { ConfigDefType, ConfigDefTypeMap } from '../../../types';

@Injectable()
export class ConfigOptionsService {
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

  public getByCode<T extends ConfigDefType>(
    defType: T,
    code: string
  ): ConfigDefTypeMap[T] {
    const defsOfType = this.getDefinitions(defType);
    const match = defsOfType.find((def) => def.code === code);
    if (!match) {
      throw new UserInputError('NO_CONFIGURABLE_OPERATION_FOUND', {
        code,
        type: defType,
      });
    }
    return match;
  }
}
