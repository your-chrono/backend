import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtSecretService } from './jwt-secret.service';
import { PayloadType, UserType } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(jwtSecret: JwtSecretService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret.secret,
    });
  }

  async validate(payload: PayloadType): Promise<UserType> {
    return {
      userRoleId: payload.userRoleId,
      userId: payload.sub,
      email: payload.email,
    };
  }
}
