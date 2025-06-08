import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  logger: ['error', 'warn', 'log'],});
  app.enableCors({
    origin: 'http://localhost:3001', // ganti sesuai frontend kamu
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
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
