import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLServerContext,
} from '@apollo/server';
import { DocumentNode, GraphQLNamedType, isUnionType } from 'graphql';

import { ConfigService } from '../../config/config.service';
import { GraphqlValueTransformer } from '../common';
import { AssetStorageStrategy } from '../../config';

/**
 * Transforms outputs so that any Asset instances are run through the {@link AssetStorageStrategy.toAbsoluteUrl}
 * method before being returned in the response.
 */
export class AssetInterceptorPlugin implements ApolloServerPlugin {
  private graphqlValueTransformer: GraphqlValueTransformer;
  private readonly toAbsoluteUrl:
    | AssetStorageStrategy['toAbsoluteUrl']
    | undefined;

  constructor(private configService: ConfigService) {
    const { assetOptions } = this.configService;
    if (assetOptions.assetStorageStrategy.toAbsoluteUrl) {
      this.toAbsoluteUrl = assetOptions.assetStorageStrategy.toAbsoluteUrl.bind(
        assetOptions.assetStorageStrategy
      );
    }
  }

  public async serverWillStart(service: GraphQLServerContext): Promise<void> {
    this.graphqlValueTransformer = new GraphqlValueTransformer(service.schema);
  }

  public async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    return {
      willSendResponse: async (requestContext) => {
        const { document } = requestContext;
        if (document) {
          const { body } = requestContext.response;
          const req = requestContext.contextValue.req;
          if (body.kind === 'single') {
            this.prefixAssetUrls(req, document, body.singleResult.data);
          }
        }
      },
    };
  }

  private prefixAssetUrls(
    request: any,
    document: DocumentNode,
    data?: Record<string, unknown> | null
  ) {
    const toAbsoluteUrl = this.toAbsoluteUrl;
    if (!toAbsoluteUrl || !data) {
      return;
    }

    const typeTree = this.graphqlValueTransformer.getOutputTypeTree(document);
    this.graphqlValueTransformer.transformValues(
      typeTree,
      data,
      (value, type) => {
        if (!type) {
          return value;
        }
        const isAssetType = this.isAssetType(type);
        const isUnionWithAssetType =
          isUnionType(type) && type.getTypes().find((t) => this.isAssetType(t));
        if (isAssetType || isUnionWithAssetType) {
          if (value && !Array.isArray(value)) {
            if (value.preview) {
              value.preview = toAbsoluteUrl(request, value.preview);
            }
            if (value.source) {
              value.source = toAbsoluteUrl(request, value.source);
            }
          }
        }
        return value;
      }
    );
  }

  private isAssetType(type: GraphQLNamedType): boolean {
    const assetTypeNames = ['Asset', 'SearchResultAsset'];
    return assetTypeNames.includes(type.name);
  }
}
