import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { webcrypto } from 'node:crypto';
import * as path from 'path';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './utils/exception';

Object.defineProperty(globalThis, 'crypto', {
  get: () => webcrypto,
  configurable: false
});

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  // Use Public folder
  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  // Global Prefix
  app.setGlobalPrefix('api');

  // Exception
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Global class-validator pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
