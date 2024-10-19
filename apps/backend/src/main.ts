import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.enableCors(corsConfig);
  app.setGlobalPrefix('/api');
  await app.listen(3000);
}
bootstrap();
