import { InjectableStrategy } from '../../../common';
import { RequestContext } from '../../../api';

export interface NamingStrategy extends InjectableStrategy {
  generateSourceFileName(
    ctx: RequestContext,
    originalFileName: string,
    conflictFileName?: string,
  ): string;
  generatePreviewFileName(
    ctx: RequestContext,
    sourceFileName: string,
    conflictFileName?: string,
  ): string;
}
