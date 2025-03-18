import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Permite requisições dessas origens
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Configuração para servir arquivos estáticos da pasta 'uploads'
  app.useStaticAssets(path.join(__dirname, '..', 'src', 'uploads'), {
    prefix: '/uploads',
  });
  
  await app.listen(3001);
}

bootstrap();
