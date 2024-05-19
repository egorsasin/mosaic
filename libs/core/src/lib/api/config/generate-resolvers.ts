import {
  adminErrorTypeResolvers,
  errorOperationTypeResolvers,
  ErrorResult,
  storeFrontErrorTypeResolvers,
} from '../../common';
import { GraphQLMoney } from './money-scalar';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';

const dummyResolveType = {
  __resolveType() {
    return null;
  },
};

const commonResolvers = {
  ErrorResult: {
    __resolveType(value: ErrorResult) {
      return value.__typename;
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Upload: require('graphql-upload-ts').GraphQLUpload || dummyResolveType,
  Money: GraphQLMoney,
  JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
};

export function generateStoreFrontResolvers() {
  return {
    ...commonResolvers,
    ...errorOperationTypeResolvers,
    ...storeFrontErrorTypeResolvers,
  };
}

export function generateAdminResolvers() {
  return {
    ...commonResolvers,
    ...errorOperationTypeResolvers,
    ...adminErrorTypeResolvers,
  };
}
