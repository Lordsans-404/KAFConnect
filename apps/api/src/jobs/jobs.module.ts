import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import {Job} from './jobs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([Job])
  ],
  providers: [JobsService]
})
export class JobsModule {}
