import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  GetUserQuery,
  GetUserQueryData,
  GetUserQueryReturnType,
  ListUsersQuery,
  ListUsersQueryData,
  ListUsersQueryReturnType,
  ResolveRoleByUserQuery,
  ResolveRoleByUserQueryData,
  ResolveRoleByUserQueryReturnType,
  ResolveTagsByProfileIdQuery,
  ResolveTagsByProfileIdQueryData,
  ResolveTagsByProfileIdQueryReturnType,
} from './queries/impl';
import {
  UpdateProfileCommand,
  UpdateProfileCommandData,
  UpdateProfileCommandReturnType,
} from './commands/impl';

@Injectable()
export class UserApiService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  getUserById(data: GetUserQueryData) {
    return this.queryBus.execute<GetUserQuery, GetUserQueryReturnType>(
      new GetUserQuery(data),
    );
  }

  resolveRoleByUser(data: ResolveRoleByUserQueryData) {
    return this.queryBus.execute<
      ResolveRoleByUserQuery,
      ResolveRoleByUserQueryReturnType
    >(new ResolveRoleByUserQuery(data));
  }

  resolveTagsByProfileId(data: ResolveTagsByProfileIdQueryData) {
    return this.queryBus.execute<
      ResolveTagsByProfileIdQuery,
      ResolveTagsByProfileIdQueryReturnType
    >(new ResolveTagsByProfileIdQuery(data));
  }

  listUsers(data: ListUsersQueryData) {
    return this.queryBus.execute<ListUsersQuery, ListUsersQueryReturnType>(
      new ListUsersQuery(data),
    );
  }

  async updateProfile(data: UpdateProfileCommandData) {
    const result = await this.commandBus.execute<
      UpdateProfileCommand,
      UpdateProfileCommandReturnType
    >(new UpdateProfileCommand(data));

    return this.getUserById({ userId: result.userId });
  }
}
