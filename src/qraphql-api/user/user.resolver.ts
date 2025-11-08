import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { UserApiService } from '../../user/user-api.service';
import { CurrentUser } from '../current-user.decorator';
import { GetUserInput, UpdateProfileInput, UsersInput } from './input';
import { UserConnection, UserModel } from './model';
import { UserType } from '../../auth/types';
import { RoleModel } from '../dictionary/model';

@UseGuards(GqlAuthGuard)
@Resolver(() => UserModel)
export class UserResolver {
  constructor(private readonly userApi: UserApiService) {}

  @Query(() => UserModel)
  me(@CurrentUser() user: UserType) {
    return this.userApi.getUserById({ userId: user.userId });
  }

  @Query(() => UserModel)
  user(@Args('data') data: GetUserInput) {
    return this.userApi.getUserById(data);
  }

  @ResolveField(() => RoleModel)
  role(@Parent() parent: UserModel) {
    return this.userApi.resolveRoleByUser({ userId: parent.id });
  }

  @Query(() => UserConnection)
  users(@Args('data') data: UsersInput) {
    return this.userApi.listUsers(data);
  }

  @Mutation(() => UserModel)
  updateMyProfile(
    @CurrentUser() user: UserType,
    @Args('data') data: UpdateProfileInput,
  ) {
    return this.userApi.updateProfile({ userId: user.userId, ...data });
  }
}
