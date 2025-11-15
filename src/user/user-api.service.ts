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
  CreateProfileCommand,
  CreateProfileCommandData,
  CreateProfileCommandReturnType,
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

  async createProfile(data: CreateProfileCommandData) {
    return this.commandBus.execute<
      CreateProfileCommand,
      CreateProfileCommandReturnType
    >(new CreateProfileCommand(data));
  }

  async updateProfile(data: UpdateProfileCommandData) {
    return this.commandBus.execute<
      UpdateProfileCommand,
      UpdateProfileCommandReturnType
    >(new UpdateProfileCommand(data));
  }
}
