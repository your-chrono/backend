import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand, LoginCommandReturnType } from '../impl';
import { YandexOAuthService } from '../../yandex-oauth.service';
import { AuthService } from '../../auth.service';
import { PrismaService } from '../../../database';
import { nanoid } from 'nanoid';
import { RoleId } from '@prisma/client';

@CommandHandler(LoginCommand)
export class LoginHandler
  implements ICommandHandler<LoginCommand, LoginCommandReturnType>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly ya: YandexOAuthService,
    private readonly authService: AuthService,
  ) {}

  public async execute({
    data,
  }: LoginCommand): Promise<LoginCommandReturnType> {
    const email = await this.ya.getEmailByCode(data.accessToken);

    const user = (await this.getUser(email)) || (await this.createUser(email));

    return {
      token: this.authService.login({
        email,
        sub: user.id,
        userRoleId: user.roleId,
      }),
    };
  }

  private getUser(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
    });
  }

  private async createUser(email: string) {
    // await walletApiService.createWallet({ userId: user.id });
    // await userApiService.createProfile({ userId: user.id });

    return this.prisma.user.create({
      data: {
        email,
        password: await this.authService.hashPassword(nanoid()),
        isEmailConfirmed: true,
        roleId: RoleId.USER,
      },
    });
  }
}
