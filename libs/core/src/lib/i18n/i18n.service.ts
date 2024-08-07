import { Injectable, OnModuleInit } from '@nestjs/common';
import { Handler, Request } from 'express';
import i18next, { TFunction } from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import ICU from 'i18next-icu';
import path from 'path';

import { ErrorResult } from '../common';

export interface I18nRequest extends Request {
  t: TFunction;
}

@Injectable()
export class I18nService implements OnModuleInit {
  public onModuleInit(): unknown {
    return i18next
      .use(Backend)
      .use(ICU)
      .init({
        nsSeparator: false,
        preload: ['pl'],
        fallbackLng: 'pl',
        backend: {
          loadPath: path.join(__dirname, '../../../messages/{{lng}}.json'),
          jsonIndent: 2,
        },
      });
  }

  public handle(): Handler {
    return i18nextMiddleware.handle(i18next);
  }

  public translateErrorResult(req: I18nRequest, error: ErrorResult): void {
    const t: TFunction = req.t;
    const key = `errorResult.${error.message}`;

    let translation: string = error.message;

    try {
      translation = t(key, error as any) as string;
    } catch (e) {
      const message =
        typeof e.message === 'string'
          ? (e.message as string)
          : JSON.stringify(e.message);

      translation += ` (Translation format error: ${message})`;
    }

    error.message = translation;
  }
}
