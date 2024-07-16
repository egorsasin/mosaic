import fs from 'fs/promises';
import path from 'path';

import { Injector, RequestContext } from '@mosaic/core';

import { LoadTemplateInput } from '../types';
import { TemplateLoader } from './template-loader';

export class FileBasedTemplateLoader implements TemplateLoader {
  constructor(private templatePath: string) {}

  public async loadTemplate(
    injector: Injector,
    ctx: RequestContext,
    { type, templateName }: LoadTemplateInput
  ): Promise<string> {
    const templatePath = path.join(this.templatePath, type, templateName);

    return fs.readFile(templatePath, 'utf-8');
  }

  public async loadPartials(): Promise<
    {
      name: string;
      content: string;
    }[]
  > {
    const partialsPath = path.join(this.templatePath, 'partials');
    const partialsFiles = await fs.readdir(partialsPath);

    return Promise.all(
      partialsFiles.map(async (file) => {
        return {
          name: path.basename(file, '.hbs'),
          content: await fs.readFile(path.join(partialsPath, file), 'utf-8'),
        };
      })
    );
  }
}
