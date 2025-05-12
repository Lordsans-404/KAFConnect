import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { LoggerMiddleware } from './logger.middleware';
import { JobsModule } from './jobs/jobs.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
    UsersModule,
    EmailModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'project1',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Auto-load entities
      synchronize: true, // Automatically sync database schema (for development only)
    }),
    JobsModule,
    EvaluationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}