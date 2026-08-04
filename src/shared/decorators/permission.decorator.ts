import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../constants/constants';
import { Permission } from '../types/enums';

export const Permissions = (...permissions: (Permission | string)[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const PermissionDecorator = Permissions;
