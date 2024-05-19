import { SetMetadata } from '@nestjs/common';

import { Permission, PERMISSIONS_METADATA_KEY } from '../common';

export const Allow = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
