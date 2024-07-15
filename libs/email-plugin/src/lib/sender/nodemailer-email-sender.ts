import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { assertNever } from '@mosaic/common';

import {
  EmailDetails,
  EmailTransportOptions,
  SMTPTransportOptions,
} from '../types';
import { EmailSender } from './email-sender';

export class NodemailerEmailSender implements EmailSender {
  private _smtpTransport?: Mail;

  public async send(
    email: EmailDetails,
    options: EmailTransportOptions
  ): Promise<void> {
    switch (options.type) {
      case 'none':
        return;
      case 'smtp':
        await this.sendMail(email, this.getSmtpTransport(options));
        break;
      default:
        return assertNever(options);
    }
  }

  private getSmtpTransport(options: SMTPTransportOptions) {
    if (!this._smtpTransport) {
      this._smtpTransport = createTransport(options);
    }
    return this._smtpTransport;
  }

  private async sendMail(
    email: EmailDetails,
    transporter: Mail
  ): Promise<unknown> {
    return transporter.sendMail({
      from: email.from,
      to: email.recipient,
      subject: email.subject,
      html: email.body,
      attachments: email.attachments,
      cc: email.cc,
      bcc: email.bcc,
      replyTo: email.replyTo,
    });
  }
}
