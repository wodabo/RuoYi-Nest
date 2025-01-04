import { SetMetadata } from '@nestjs/common';

export const PREAUTHORIZE_KEY = 'preauthorize';

export function PreAuthorize(permission: string) {
  return SetMetadata(PREAUTHORIZE_KEY, permission);
}
