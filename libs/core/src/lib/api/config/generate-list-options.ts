import { ValidationLevel, stitchSchemas } from '@graphql-tools/stitch';
import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
  buildSchema,
  isNonNullType,
  isObjectType,
} from 'graphql';

function unwrapNonNullType(
  type: GraphQLOutputType | GraphQLInputType
): GraphQLNamedType | GraphQLList<GraphQLOutputType | GraphQLInputType> {
  if (isNonNullType(type)) {
    return type.ofType;
  }
  return type;
}

function isListQueryType(type: GraphQLOutputType): type is GraphQLObjectType {
  const innerType = unwrapNonNullType(type);

  return (
    isObjectType(innerType) &&
    !!innerType.getInterfaces().find((i) => i.name === 'PaginatedList')
  );
}

export function generateListOptions(
  typeDefsOrSchema: string | GraphQLSchema
): GraphQLSchema {
  const schema: GraphQLSchema =
    typeof typeDefsOrSchema === 'string'
      ? buildSchema(typeDefsOrSchema)
      : typeDefsOrSchema;
  const queryType = schema.getQueryType();

  if (!queryType) {
    return schema;
  }

  const objectTypes = Object.values(schema.getTypeMap()).filter(isObjectType);
  const allFields = objectTypes.reduce((fields, type) => {
    const typeFields = Object.values(type.getFields()).filter((f) =>
      isListQueryType(f.type)
    );
    return [...fields, ...typeFields];
  }, []);
  const generatedTypes: GraphQLNamedType[] = [];

  for (const query of allFields) {
    const targetTypeName = unwrapNonNullType(query.type)
      .toString()
      .replace(/List$/, '');
    const targetType: GraphQLNamedType = schema.getType(targetTypeName);

    if (targetType && isObjectType(targetType)) {
      const existingListOptions = schema.getType(
        `${targetTypeName}ListOptions`
      ) as GraphQLInputObjectType | null;

      const generatedListOptions: GraphQLInputObjectType =
        new GraphQLInputObjectType({
          name: `${targetTypeName}ListOptions`,
          fields: {
            skip: {
              type: GraphQLInt,
              description: 'Skips the first n results, for use in pagination',
            },
            take: {
              type: GraphQLInt,
              description: 'Takes n results, for use in pagination',
            },
            ...(existingListOptions ? existingListOptions.getFields() : {}),
          },
        });

      generatedTypes.push(generatedListOptions);
    }
  }

  return stitchSchemas({
    subschemas: [schema],
    types: generatedTypes,
    typeMergingOptions: {
      validationSettings: { validationLevel: ValidationLevel.Off },
    },
  });
}
