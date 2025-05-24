import { Injectable,
  ConflictException, 
  UnauthorizedException,
  NotFoundException 
 } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './jobs.entity';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';

@Injectable()
export class JobsService {
	constructor(
		@InjectRepository(Job)
    	private readonly jobRepository: Repository<Job>,
	){}

	async createJob(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create(createJobDto);
    return this.jobRepository.save(job);
  }

  async updateJob(id: number, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException(`Job with ID ${id} not found`);

    Object.assign(job, updateJobDto);
    return this.jobRepository.save(job);
  }

  async getAllJobs() {
    return this.jobRepository.find({
      relations: ['applications'],
    }) || undefined;
  }
}
