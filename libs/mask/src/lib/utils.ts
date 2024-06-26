import { placeholderChar as defaultPlaceholderChar } from './constants';

export function convertMaskToPlaceholder(
  mask: any,
  placeholderChar = defaultPlaceholderChar
) {
  if (!isArray(mask)) {
    throw new Error(
      'Text-mask:convertMaskToPlaceholder; The mask property must be an array.'
    );
  }

  if (mask.indexOf(placeholderChar) !== -1) {
    throw new Error(
      'Placeholder character must not be used as part of the mask. Please specify a character ' +
        'that is not present in your mask as your placeholder character.\n\n' +
        `The placeholder character that was received is: ${JSON.stringify(
          placeholderChar
        )}\n\n` +
        `The mask that was received is: ${JSON.stringify(mask)}`
    );
  }

  return mask
    .map((char: string | RegExp) => {
      return char instanceof RegExp ? placeholderChar : char;
    })
    .join('');
}

export function isArray(value: unknown): boolean {
  return (Array.isArray && Array.isArray(value)) || value instanceof Array;
}

export function isString(value: unknown): boolean {
  return typeof value === 'string' || value instanceof String;
}

export function isNumber(value: unknown) {
  return typeof value === 'number' && !isNaN(value);
}

export function isNil(value: unknown) {
  return typeof value === 'undefined' || value === null;
}

const strCaretTrap = '[]';
export function processCaretTraps(mask: any) {
  const indexes = [];

  let indexOfCaretTrap;
  while (
    ((indexOfCaretTrap = mask.indexOf(strCaretTrap)), indexOfCaretTrap !== -1)
  ) {
    // eslint-disable-line
    indexes.push(indexOfCaretTrap);

    mask.splice(indexOfCaretTrap, 1);
  }

  return { maskWithoutCaretTraps: mask, indexes };
}
