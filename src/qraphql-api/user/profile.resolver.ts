import { ProfileModel } from './model';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserApiService } from '../../user/user-api.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly userApi: UserApiService) {}

  @ResolveField()
  tags(@Parent() parent: ProfileModel) {
    return this.userApi.resolveTagsByProfileId({ profileId: parent.id });
  }
}
