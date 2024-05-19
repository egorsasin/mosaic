// eslint-disable-next-line @typescript-eslint/no-var-requires
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 16);

export function generatePublicId(): string {
  return nanoid();
}
