import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { RoleModel } from './model';
import { DictionaryApiService } from '../../dictionary/dictionary-api.service';

@Resolver(() => RoleModel)
export class RoleResolver {
  constructor(private readonly dictionariesApi: DictionaryApiService) {}

  @ResolveField()
  permissions(@Parent() parent: RoleModel) {
    return this.dictionariesApi.resolvePermissionsByRole({ roleId: parent.id });
  }
}
