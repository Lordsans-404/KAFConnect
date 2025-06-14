import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { JobsService } from '../jobs/jobs.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job,JobApplication } from '../jobs/jobs.entity';
import { User, UserProfile } from '../users/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { EvaluationModule } from '../evaluation/evaluation.module'


@Module({
  imports: [
    TypeOrmModule.forFeature([Job,JobApplication, User, UserProfile]),
    EmailModule,
    EvaluationModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '60m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AdminService,UsersService,JobsService],
  controllers: [AdminController]
})
export class AdminModule {}
