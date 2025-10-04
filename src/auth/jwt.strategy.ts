import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtSecretService } from './jwt-secret.service';
import { IAuthUser } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(jwtSecret: JwtSecretService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret.secret,
    });
  }

  async validate(payload: any): Promise<IAuthUser> {
    return { userId: payload.sub, email: payload.email };
  }
}
