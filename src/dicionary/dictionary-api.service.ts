import { QueryBus } from '@nestjs/cqrs';

import { Injectable } from '@nestjs/common';
import {
  ResolvePermissionsByRoleQuery,
  ResolvePermissionsByRoleQueryData,
  ResolvePermissionsByRoleQueryReturnType,
} from './queries/impl';

@Injectable()
export class DictionaryApiService {
  constructor(private readonly queryBus: QueryBus) {}

  resolvePermissionsByRole(data: ResolvePermissionsByRoleQueryData) {
    return this.queryBus.execute<
      ResolvePermissionsByRoleQuery,
      ResolvePermissionsByRoleQueryReturnType
    >(new ResolvePermissionsByRoleQuery(data));
  }
}
