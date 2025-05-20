import { Injectable,
  ConflictException, 
  UnauthorizedException,
  NotFoundException 
 } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './jobs.entity';

@Injectable()
export class JobsService {
	constructor(
		@InjectRepository(Job)
    	private readonly jobRepo: Repository<Job>,
	){}
}
