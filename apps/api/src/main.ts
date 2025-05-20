import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  logger: ['error', 'warn', 'log'],});
  app.enableCors({
    origin: 'http://localhost:3001', // ganti sesuai frontend kamu
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
