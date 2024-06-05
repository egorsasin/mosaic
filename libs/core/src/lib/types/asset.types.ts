import { Upload } from 'graphql-upload-ts';

import { MimeTypeError } from '@mosaic/common';

import { Asset } from '../data';

export type CreateAssetResult = Asset | MimeTypeError;

export type CreateAssetInput = {
  file: Upload;
};
