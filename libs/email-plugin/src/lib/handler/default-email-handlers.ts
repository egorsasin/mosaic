import { EmailEventHandler } from '.';
import { EventWithContext } from '../types';

export const defaultEmailHandlers: Array<
  EmailEventHandler<string, EventWithContext>
> = [];
