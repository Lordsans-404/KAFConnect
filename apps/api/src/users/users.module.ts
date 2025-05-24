import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserProfile } from './users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { JobsService } from '../jobs/jobs.service';
import { Job, JobApplication } from '../jobs/jobs.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    TypeOrmModule.forFeature([Job, JobApplication]),
    
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '60m' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
    ],
  controllers: [UsersController],
  providers: [UsersService,JobsService]
})
export class UsersModule {}
