import { RoleId } from '@prisma/client';

export type PayloadType = {
  userRoleId: RoleId;
  email: string;
  sub: string;
  iat: number;
  exp: number;
};

export type UserType = {
  userRoleId: RoleId;
  userId: string;
  email: string;
};
