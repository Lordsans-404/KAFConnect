import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  console.log('Hello from main.ts');
  const app = await NestFactory.create(AppModule,{
  logger: ['error', 'warn', 'log'],});
  app.enableCors({
    origin: true, // ganti sesuai frontend kamu
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          err =>
            Object.values(err.constraints || {}).join(', ')
        );
        return new BadRequestException(messages);
      },
    }),
  );
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

}
bootstrap();
