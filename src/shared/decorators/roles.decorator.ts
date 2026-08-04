import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/constants';
import { Role } from '../types/enums';

export const Roles = (...roles: (Role | string)[]) => SetMetadata(ROLES_KEY, roles);
