import { Module,forwardRef } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { Test, Submission, Question, Choice, Answer } from './evaluation.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module'
import { JobsModule } from '../jobs/jobs.module'
import { User } from '../users/users.entity'
import { JobApplication } from '../jobs/jobs.entity'

@Module({
  imports:[
    TypeOrmModule.forFeature([Test, Submission, Question, Choice, Answer, User,JobApplication]),
    forwardRef(()=>UsersModule),
    JobsModule
  ],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
