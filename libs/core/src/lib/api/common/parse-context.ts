import { Request, Response } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

/**
 * Parses in the Nest ExecutionContext of the incoming request, accounting for both
 * GraphQL & REST requests.
 */
export function parseContext(context: ExecutionContext | ArgumentsHost): RestContext | GraphQLContext {
  if (context.getType() === 'http') {
    const httpContext = context.switchToHttp();
    return {
      isGraphQL: false,
      req: httpContext.getRequest(),
      res: httpContext.getResponse(),
      info: undefined,
    };
  } else if (context.getType<GqlContextType>() === 'graphql') {
    const gqlContext = GqlExecutionContext.create(context as ExecutionContext);
    return {
      isGraphQL: true,
      req: gqlContext.getContext().req,
      res: gqlContext.getContext().res,
      info: gqlContext.getInfo(),
    };
  } else {
    throw new Error(`Context "${context.getType()}" is not supported.`);
  }
}

export type RestContext = {
  req: Request;
  res: Response;
  isGraphQL: false;
  info: undefined;
};

export type GraphQLContext = {
  req: Request;
  res: Response;
  isGraphQL: true;
  info: GraphQLResolveInfo;
};
