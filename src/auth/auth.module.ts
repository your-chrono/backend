import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { AUTH_COMMANDS } from './commands';
import { AuthApiService } from './auth-api.service';


@Module({
    imports: [
        CqrsModule,
        DatabaseModule,
    ],
    providers: [
        ...AUTH_COMMANDS,
        AuthApiService,
    ],
    exports: [AuthApiService],
})
export class AuthModule {
}
