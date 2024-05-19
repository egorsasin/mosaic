import { isClassInstance, isObject, simpleDeepClone } from '@mosaic/common';

import { MosaicConfig, PartialMosaicConfig } from './config';

export function mergeConfig<T extends MosaicConfig>(target: T, source: PartialMosaicConfig, depth = 0): T {
  if (!source) {
    return target;
  }

  if (depth === 0) {
    target = simpleDeepClone(target);
  }

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject((source as any)[key])) {
        if (!(target as any)[key]) {
          Object.assign(target as any, { [key]: {} });
        }
        if (!isClassInstance((source as any)[key])) {
          mergeConfig((target as any)[key], (source as any)[key], depth + 1);
        } else {
          (target as any)[key] = (source as any)[key];
        }
      } else {
        Object.assign(target, { [key]: (source as any)[key] });
      }
    }
  }
  return target;
}
