import { GraphQLResolveInfo } from 'graphql';

export type ApiType = 'admin' | 'shop' | 'custom';

export function getApiType(info?: GraphQLResolveInfo): ApiType {
  const query = info && info.schema.getQueryType();
  if (query) {
    return query.getFields().administrators ? 'admin' : 'shop';
  }

  return 'custom';
}
