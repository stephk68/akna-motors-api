import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/constants';

export const isPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Public = isPublic;
