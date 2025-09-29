import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import { ConsoleLogger } from '@nestjs/common';
import { registerGraphqlEnums } from './shared';

const DEFAULT_PORT = 8080;

async function bootstrap(): Promise<void> {
  registerGraphqlEnums();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: process.env.NODE_ENV === 'development',
    }),
  });
  const config = app.get(ConfigService);

  app.set('trust proxy', true);
  app.enableCors();

  const port = config.get('PORT') ?? DEFAULT_PORT;

  await app.listen(port);
}

void bootstrap();
