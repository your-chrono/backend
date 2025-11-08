import {
  GetUserHandler,
  ListUsersHandler,
  ResolveRoleByUserHandler,
} from './handlers';
import { ResolveTagsByProfileIdHandler } from './handlers/resolve-tags-by-profile-id.handler';

export const USER_QUERIES = [
  GetUserHandler,
  ListUsersHandler,
  ResolveRoleByUserHandler,
  ResolveTagsByProfileIdHandler,
];
