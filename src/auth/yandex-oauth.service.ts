import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

type YandexUserInfo = {
  id: string;
  default_email?: string;
  emails?: string[];
};

@Injectable()
export class YandexOAuthService {
  constructor(private readonly http: HttpService) {}

  async getEmailByCode(accessToken: string): Promise<string> {
    const profile = await this.loadUserInfo(accessToken);

    const email =
      profile.default_email ||
      (Array.isArray(profile.emails) ? profile.emails[0] : undefined);
    if (!email)
      throw new InternalServerErrorException('Yandex: email not found');
    return email.toLowerCase();
  }

  private async loadUserInfo(accessToken: string): Promise<YandexUserInfo> {
    const url = 'https://login.yandex.ru/info?format=json';

    const { data } = await firstValueFrom(
      this.http.get<YandexUserInfo>(url, {
        headers: { Authorization: `OAuth ${accessToken}` },
      }),
    );
    if (!data?.id)
      throw new InternalServerErrorException('Yandex user info failed');
    return data;
  }
}
