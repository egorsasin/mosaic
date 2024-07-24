import { Attachment } from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { Injector, MosaicEvent, RequestContext } from '@mosaic/core';

import { TemplateLoader } from './template-loader';
import { EmailEventHandler } from './handler/event-handler';
import { EmailSender } from './sender';

export interface SMTPTransportOptions extends SMTPTransport.Options {
  type: 'smtp';
  logging?: boolean;
}

export interface NoopTransportOptions {
  type: 'none';
}

export type EmailTransportOptions = SMTPTransportOptions | NoopTransportOptions;

export type EventWithContext = MosaicEvent & { ctx: RequestContext };

export type EventWithAsyncData<Event extends EventWithContext, R> = Event & {
  data: R;
};

export type SetTemplateVarsFn<E> = (
  event: E,
  globals: { [key: string]: unknown }
) => { [key: string]: unknown };

export type LoadDataFn<Event extends EventWithContext, R> = (context: {
  event: Event;
  injector: Injector;
}) => Promise<R>;

export interface LoadTemplateInput {
  type: string;
  templateName: string;
  templateVars: unknown;
}

export interface EmailPluginOptions {
  templatePath: string;
  handlers: Array<EmailEventHandler<string, EventWithContext>>;
  transport:
    | EmailTransportOptions
    | ((
        injector?: Injector,
        ctx?: RequestContext
      ) => EmailTransportOptions | Promise<EmailTransportOptions>);
  emailSender?: EmailSender;
  templateLoader?: TemplateLoader;
  globalTemplateVars?: { [key: string]: unknown };
}

export type InitializedEmailPluginOptions = EmailPluginOptions & {
  templateLoader: TemplateLoader;
};

export type OptionalToNullable<O> = {
  [K in keyof O]-?: undefined extends O[K] ? NonNullable<O[K]> | null : O[K];
};

export type EmailAttachment = Omit<Attachment, 'raw'> & { path?: string };

export type SerializedAttachment = OptionalToNullable<
  Omit<EmailAttachment, 'content'> & { content: string | null }
>;

export interface EmailDetails<
  Type extends 'serialized' | 'unserialized' = 'unserialized'
> {
  from: string;
  recipient: string;
  subject: string;
  body: string;
  attachments: Array<
    Type extends 'serialized' ? SerializedAttachment : Attachment
  >;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

export type SerializedRequestContext = {
  authorizedAsOwnerOnly: boolean;
};

export type IntermediateEmailDetails = {
  type: string;
  from: string;
  recipient: string;
  templateVars: Record<string, unknown>;
  subject: string;
  templateFile: string;
  attachments: SerializedAttachment[];
  cc?: string;
  bcc?: string;
  replyTo?: string;
};
