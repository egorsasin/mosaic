// eslint-disable-next-line @typescript-eslint/no-var-requires
const { customAlphabet } = require('nanoid');

const nanoidPrefix = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ', 6);
const nanoidNumber = customAlphabet('1234567890', 10);

export function generatePublicId(): string {
  return `${nanoidPrefix()}${nanoidNumber()}`;
}
