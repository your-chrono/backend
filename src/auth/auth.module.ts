import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database';
import { AUTH_COMMANDS } from './commands';
import { AuthApiService } from './auth-api.service';
import { ConfigModule } from '@nestjs/config';
import { YandexOAuthService } from './yandex-oauth.service';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { JwtSecretService } from './jwt-secret.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    ConfigModule,
    HttpModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [
    ...AUTH_COMMANDS,
    AuthApiService,
    YandexOAuthService,
    AuthService,
    JwtStrategy,
    JwtSecretService,
  ],
  exports: [AuthApiService],
})
export class AuthModule {}
