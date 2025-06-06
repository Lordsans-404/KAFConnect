import { Module, forwardRef } from '@nestjs/common';
import { JobsService } from './jobs.service';
import {Job, JobApplication} from './jobs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module'
import { User } from '../users/users.entity'

@Module({
  imports:[
    TypeOrmModule.forFeature([Job, JobApplication, User]),
    forwardRef(() => UsersModule)
  ],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule {}
