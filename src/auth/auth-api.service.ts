import { CommandBus } from '@nestjs/cqrs';

import { Injectable } from '@nestjs/common';
import {
  LoginCommand,
  LoginCommandData,
  LoginCommandReturnType,
} from './commands/impl';

@Injectable()
export class AuthApiService {
  constructor(private readonly commandBus: CommandBus) {}

  login(data: LoginCommandData) {
    return this.commandBus.execute<LoginCommand, LoginCommandReturnType>(
      new LoginCommand(data),
    );
  }
}
