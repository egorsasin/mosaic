import { InternalServerErrorException } from '@nestjs/common';
import {
  buildASTSchema,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLSchema,
  isInputObjectType,
} from 'graphql';
import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';

import { AuthenticationStrategy } from '../../config';

export function generateAuthenticationTypes(
  schema: GraphQLSchema,
  authenticationStrategies: AuthenticationStrategy[]
): GraphQLSchema {
  const fields: GraphQLInputFieldConfigMap = {};
  const strategySchemas: GraphQLSchema[] = [];

  for (const strategy of authenticationStrategies) {
    const inputSchema = buildASTSchema(strategy.defineInputType());

    const inputType = Object.values(inputSchema.getTypeMap()).find(
      (type): type is GraphQLInputObjectType => isInputObjectType(type)
    );

    if (!inputType) {
      throw new InternalServerErrorException(
        `${strategy.constructor.name}.defineInputType() does not define a GraphQL Input type`
      );
    }

    fields[strategy.name] = { type: inputType };
    strategySchemas.push(inputSchema);
  }
  const authenticationInput = new GraphQLInputObjectType({
    name: 'AuthenticationInput',
    fields,
  });

  return stitchSchemas({
    subschemas: [schema, ...strategySchemas],
    types: [authenticationInput],
    typeMergingOptions: {
      validationSettings: { validationLevel: ValidationLevel.Off },
    },
  });
}
