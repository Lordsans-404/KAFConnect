import { Module,forwardRef } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { Test, Submission, Question, Choice, Answer } from './evaluation.entity'
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module'
import { User } from '../users/users.entity'

@Module({
  imports:[
    TypeOrmModule.forFeature([Test, Submission, Question, Choice, Answer, User]),
    forwardRef(()=>UsersModule)
  ],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
