import { Injectable,
  ConflictException, 
  UnauthorizedException,
  NotFoundException
 } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job,JobApplication, ApplicationStatus } from './jobs.entity';
import { User } from '../users/users.entity';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { CreateJobApplicationDto, UpdateJobApplicationDto } from './dto/createApplicationJob.dto';

@Injectable()
export class JobsService {
	constructor(
		@InjectRepository(Job)
      private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
      private readonly jobApplicationRepository: Repository<JobApplication>,
    @InjectRepository(User)
      private readonly userRepository: Repository<User>,

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
    // Old version: no pagination
    return this.jobRepository.find({
      relations: ['applications'],
      take: 5, // default limit
    });
  }

  async getPaginatedJobs(page = 1, limit = 10) {
    const take = limit;
    const skip = (page - 1) * take;

    const [jobs, total] = await this.jobRepository.findAndCount({
      relations: ['applications'],
      skip,
      take,
    });

    return {
      data: jobs,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }


  // Get all jobs except the one that user have Not applied
  async getUnappliedJobs(userId: any): Promise<Job[]> {
    return this.jobRepository
      .createQueryBuilder('job')
      .leftJoin(
        'job.applications',
        'application',
        'application.userApplicant.id = :userId',
        { userId },
      )
      .where('application.id IS NULL')
      .andWhere('job.isActive = :isActive', { isActive: true })
      .getMany();
  }

  // Get jobs that user HAS applied to
  async getAppliedJobs(userId: any): Promise<JobApplication[]> {
    return this.jobApplicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('job.testId', 'testId')
      .where('application.userApplicant.id = :userId', { userId })
      .andWhere('job.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async getAllApplicants(){
    return this.jobApplicationRepository.find({
      relations: ["job", "userApplicant"]
    }) || undefined
  }

  async userApplyJob(dto:CreateJobApplicationDto){
    const job = await this.jobRepository.findOne({
      where: {id: dto.jobId, isActive: true}
    })
    if (!job) {
      throw new NotFoundException('Pekerjaan tidak ditemukan.');
    }
    const user = await this.userRepository.findOne({ where: { id: dto.applicantId } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }
    const existingApplication = await this.jobApplicationRepository.findOne({
      where: {
        job: { id: dto.jobId },
        userApplicant: { id: dto.applicantId }
      },
      relations: ['job', 'userApplicant']
    });
    if (existingApplication) {
      throw new ConflictException('Kamu sudah melamar ke pekerjaan ini.');
    }

    const application = this.jobApplicationRepository.create({
      job,
      userApplicant: user,
      coverLetter: dto.coverLetter,
      resumePath: dto.resumePath,
      status: ApplicationStatus.SUBMITTED,
    });

    await this.jobApplicationRepository.save(application);

    return { message: 'Lamaran berhasil dikirim.' };
  }


  async updateApplication(id: number, dto: UpdateJobApplicationDto): Promise<JobApplication> {
    const application = await this.jobApplicationRepository.findOne({
      where: { id },
      relations: ['job', 'userApplicant'],
    });
    const now = new Date()
    now.setDate(now.getDate() + 2);
    if (!application) throw new NotFoundException('Application not found');

    // Hanya update field yang dikirim (jaga-jaga null/undefined)
    if (dto.status !== undefined){
      application.status = dto.status
      if(dto.status === "written_test")
        application.testExpiredAt = now
    }
    if (dto.resumePath !== undefined) application.resumePath = dto.resumePath;
    if (dto.coverLetter !== undefined) application.coverLetter = dto.coverLetter;
    if (dto.adminNotes !== undefined) application.adminNotes = dto.adminNotes;

    return this.jobApplicationRepository.save(application);
  }
}
