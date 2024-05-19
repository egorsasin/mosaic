import { Request, Response } from 'express';

import { AuthOptions } from '../../config';

/**
 * Sets the authToken as a response header
 */
// export function setSessionToken(options: {
//   sessionToken: string;
//   authOptions: Required<AuthOptions>;
//   res: Response;
// }) {
//   const { authOptions, sessionToken, res } = options;

//   res.set(authOptions.authTokenHeaderKey, sessionToken);
// }

/**
 * Get the session token from the Authorization header
 */
export function extractSessionToken(req: Request): string | undefined {
  return getFromHeader(req);
}

function getFromHeader(req: Request): string | undefined {
  const authHeader = req.get('Authorization');

  if (authHeader) {
    const matches = authHeader.trim().match(/^bearer\s(.+)$/i);

    if (matches) {
      return matches[1];
    }
  }
}
