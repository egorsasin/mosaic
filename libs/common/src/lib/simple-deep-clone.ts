import { isClassInstance } from './shared-utils';

export function simpleDeepClone<T extends string | number | any[] | object>(input: T): T {
  if (typeof input !== 'object' || input === null) {
    return input;
  }
  let output: any;
  let i: number | string;

  if (input instanceof Array) {
    let l: number;
    output = [] as any[];
    for (i = 0, l = input.length; i < l; i++) {
      output[i] = simpleDeepClone(input[i]);
    }
    return output;
  }
  if (isClassInstance(input)) {
    return input;
  }

  output = {};
  for (i in input) {
    if (input.hasOwnProperty(i)) {
      output[i] = simpleDeepClone((input as any)[i]);
    }
  }
  return output;
}
