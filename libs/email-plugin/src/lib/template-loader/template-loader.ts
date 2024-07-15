import { Injector, RequestContext } from '@mosaic/core';

import { LoadTemplateInput, Partial } from '../types';

export interface TemplateLoader {
  loadTemplate(
    injector: Injector,
    ctx: RequestContext,
    input: LoadTemplateInput
  ): Promise<string>;

  loadPartials?(): Promise<Partial[]>;
}
