import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import dateFormat from 'dateformat';

import { InitializedEmailPluginOptions } from '../types';

import { EmailGenerator } from './email-generator';

export class HandlebarsMjmlGenerator implements EmailGenerator {
  public async onInit(options: InitializedEmailPluginOptions) {
    if (options.templateLoader.loadPartials) {
      const partials = await options.templateLoader.loadPartials();
      partials.forEach(({ name, content }) =>
        Handlebars.registerPartial(name, content)
      );
    }

    this.registerHelpers();
  }

  public generate(
    from: string,
    subject: string,
    template: string,
    templateVars: Record<string, unknown>
  ) {
    const compiledFrom = Handlebars.compile(from, { noEscape: true });
    const compiledSubject = Handlebars.compile(subject);
    const compiledTemplate = Handlebars.compile(template);

    const fromResult = compiledFrom(templateVars, {
      allowProtoPropertiesByDefault: true,
    });

    const subjectResult = compiledSubject(templateVars, {
      allowProtoPropertiesByDefault: true,
    });
    const ml = compiledTemplate(templateVars, {
      allowProtoPropertiesByDefault: true,
    });
    const body = mjml2html(ml).html;

    return { from: fromResult, subject: subjectResult, body };
  }

  private registerHelpers() {
    Handlebars.registerHelper(
      'formatDate',
      (date: Date | undefined, format: string | object) => {
        if (!date) {
          return date;
        }

        if (typeof format !== 'string') {
          format = 'default';
        }

        return dateFormat(date, format);
      }
    );

    Handlebars.registerHelper('formatMoney', (amount?: number) => {
      if (!amount) {
        return amount;
      }

      const num = (amount / 100).toFixed(2);
      const re = '\\d(?=(\\d{3})+' + '\\D' + ')';

      return num.replace('.', ',').replace(new RegExp(re, 'g'), '$&' + ' ');
    });
  }
}
