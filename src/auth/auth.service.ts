import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtSecretService } from './jwt-secret.service';
import { RoleId } from '@prisma/client';

const SALT = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtSecret: JwtSecretService,
  ) {}

  public login(payload: { userRoleId: RoleId; email: string; sub: string }) {
    return this.jwtService.sign(
      { ...payload },
      { secret: this.jwtSecret.secret },
    );
  }

  public hashPassword(password: string) {
    return bcrypt.hash(password, SALT);
  }

  public comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  public generateConfirmationCode(): string {
    return crypto.randomUUID().toString();
  }
}
