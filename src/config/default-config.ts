import { RuntimeConfig } from './config';
import { EmptyPreviewStrategy, EmptyStorageStrategy } from './strategies';

export const defaultConfig: RuntimeConfig = {
  apiOptions: {
    port: 3000,
  },
  mediaOptions: {
    storageStrategy: new EmptyStorageStrategy(),
    previewStrategy: new EmptyPreviewStrategy(),
    permittedFileTypes: ['image/*', 'video/*', 'audio/*', '.pdf'],
    uploadMaxFileSize: 20971520,
  },
  plugins: [],
};
