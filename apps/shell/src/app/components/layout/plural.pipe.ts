import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plural',
})
export class PluralPipe implements PipeTransform {
  transform(
    value: number,
    singular: string,
    pluralFew: string,
    pluralMany: string
  ): string {
    if (!Number.isInteger(value) || value < 0) {
      return `${value} ${pluralMany}`;
    }

    const lastDigit = value % 10;
    const lastTwoDigits = value % 100;

    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return `${value} ${singular}`;
    } else if (
      lastDigit >= 2 &&
      lastDigit <= 4 &&
      (lastTwoDigits < 10 || lastTwoDigits >= 20)
    ) {
      return `${value} ${pluralFew}`;
    } else {
      return `${value} ${pluralMany}`;
    }
  }
}
