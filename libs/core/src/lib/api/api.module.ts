import * as path from 'path';
import { buildSchema, extendSchema, GraphQLSchema, printSchema } from 'graphql';
import {
  Injectable,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule, GraphQLTypesLoader } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { graphqlUploadExpress } from 'graphql-upload-ts';

import { notNullOrUndefined } from '@mosaic/common';

import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ServiceModule } from '../service/service.module';
import { getPluginAPIExtensions } from '../plugin';
import { I18nModule } from '../i18n/i18n.module';

import {
  ResolverModule,
  AdminResolverModule,
} from './resolvers/resolver.module';
import {
  generateAdminResolvers,
  generateAuthenticationTypes,
  generateListOptions,
  generateStoreFrontResolvers,
} from './config';
import { AuthGuard } from './guards';
import { Request, Response, NextFunction } from 'express';
import {
  AssetInterceptorPlugin,
  MosErrorResultInterceptor,
} from './middleware';
import { ApiType } from './types';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    next();
  }
}

export interface GraphQLApiOptions {
  typePaths: string[];
  apiPath: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  include: Function;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers: any;
  apiType: ApiType;
}

function configuregGraphQLModule(options: GraphQLApiOptions) {
  return GraphQLModule.forRootAsync<ApolloDriverConfig>({
    driver: ApolloDriver,
    useFactory: async (
      configService: ConfigService,
      typesLoader: GraphQLTypesLoader
    ) => {
      const { apiPath, include, resolvers, apiType } = options;

      return {
        driver: ApolloDriver,
        typeDefs: printSchema(await buildSchemaForApi(apiType)),
        include: [include],
        context: ({ req, res }) => ({ req, res }),
        inheritResolversFromInterfaces: true,
        fieldResolverEnhancers: ['guards'],
        resolvers,
        cors: {
          origin: true,
          credentials: true,
        },
        playground: false,
        debug: false,
        path: `/${apiPath}`,
        plugins: [
          ApolloServerPluginLandingPageLocalDefault(),
          new AssetInterceptorPlugin(configService),
        ],
      };

      async function buildSchemaForApi(
        apiType: ApiType
      ): Promise<GraphQLSchema> {
        const normalizedPaths = options.typePaths.map((p) =>
          path.join('./**/schema', p, '/**/*.graphql')
        );
        const typeDefs = await typesLoader.mergeTypesByPaths(normalizedPaths);
        const authStrategies = configService.authOptions.authenticationStrategy;

        let schema = buildSchema(typeDefs);

        getPluginAPIExtensions(configService.plugins, apiType)
          .map((e) => (typeof e.schema === 'function' ? e.schema() : e.schema))
          .filter(notNullOrUndefined)
          .forEach((documentNode) => {
            schema = extendSchema(schema, documentNode);
          });

        schema = generateAuthenticationTypes(schema, authStrategies);
        schema = generateListOptions(schema);

        return schema;
      }
    },
    inject: [ConfigService, GraphQLTypesLoader],
    imports: [ConfigModule],
  });
}

@Module({
  imports: [
    ConfigModule,
    ServiceModule,
    AdminResolverModule,
    ResolverModule,
    I18nModule,
    configuregGraphQLModule({
      apiPath: 'graphql',
      typePaths: ['common', 'shell'],
      include: ResolverModule,
      apiType: 'shop',
      resolvers: generateStoreFrontResolvers(),
    }),
    configuregGraphQLModule({
      apiPath: 'admin',
      apiType: 'admin',
      typePaths: ['common', 'admin'],
      include: AdminResolverModule,
      resolvers: generateAdminResolvers(),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MosErrorResultInterceptor,
    },
  ],
})
export class ApiModule implements NestModule {
  constructor(private configService: ConfigService) {}

  public async configure(consumer: MiddlewareConsumer): Promise<void> {
    const { uploadMaxFileSize } = this.configService.assetOptions;

    consumer
      .apply(
        LoggerMiddleware,
        graphqlUploadExpress({ maxFileSize: uploadMaxFileSize })
      )
      .forRoutes({ path: 'admin', method: RequestMethod.POST });
  }
}
