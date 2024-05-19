import { ContextType, createParamDecorator, ExecutionContext } from '@nestjs/common';

import { REQUEST_CONTEXT_KEY } from '../common';

export const Ctx = createParamDecorator((_, ctx: ExecutionContext) => {
  const getContext = (req: any) => req[REQUEST_CONTEXT_KEY];

  if (ctx.getType<ContextType | 'graphql'>() === 'graphql') {
    return getContext(ctx.getArgByIndex(2).req);
  } else {
    return getContext(ctx.switchToHttp().getRequest());
  }
});
