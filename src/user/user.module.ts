import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../database';
import { USER_COMMANDS } from './commands';
import { USER_QUERIES } from './queries';
import { UserApiService } from './user-api.service';

@Module({
  imports: [CqrsModule, DatabaseModule],
  providers: [UserApiService, ...USER_COMMANDS, ...USER_QUERIES],
  exports: [UserApiService],
})
export class UserModule {}
