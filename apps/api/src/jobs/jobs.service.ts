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

  async findOne(id:number){
    const job = await this.jobRepository.findOne({where: {id}})
    if (!job) {
      throw new NotFoundException('Pekerjaan tidak ditemukan.');
    }
    return this.checkExpiredJob(job)
  }

  // To check if the job is expired
  async checkExpiredJob(job: Job): Promise<Job>{
    if(job.closingDate && job.closingDate < new Date() && job.isActive){
      job.isActive = false;
      await this.jobRepository.save(job)
    }
    return job;
  }

  async checkExpMultipleJob(jobs:Job[]): Promise<Job[]>{
    const expiredJobs = jobs.filter(
      job => job.closingDate && job.closingDate < new Date() && job.isActive
    ); // cek apakah closingDate ada dan waktu sekarang telah melebihi closingDate, dan isActive true


    if (expiredJobs.length > 0) {
      await this.jobRepository.save(
        expiredJobs.map(job => ({ ...job, isActive: false }))
      );
    }
    return jobs.map(job => {
      if (job.closingDate && job.closingDate < new Date()) {
        job.isActive = false;
      }
      return job;
    });
  }

  async getAllJobs() {
    // Old version: no pagination
    const job = await this.jobRepository.find({
      relations: ['applications'],
      take: 5, // default limit
    });
    return this.checkExpMultipleJob(job)
  }

  async getDepartmentStats() {
    return this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.applications', 'application')
      .select('job.department', 'department')
      .addSelect('COUNT(DISTINCT job.id)', 'jobs')
      .addSelect('COUNT(application.id)', 'applications')
      .groupBy('job.department')
      .getRawMany();
  }

  async getEmploymentTypeStats() {
    return this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.applications', 'application')
      .select('job.employmentType', 'type')
      .addSelect('COUNT(DISTINCT job.id)', 'jobs')
      .addSelect('COUNT(application.id)', 'applications')
      .groupBy('job.employmentType')
      .getRawMany();
  }

  async getPaginatedJobs(page = 1, limit = 10) {
    const take = limit;
    const skip = (page - 1) * take;

    const [jobs, total] = await this.jobRepository.findAndCount({
      relations: ['applications'],
      skip,
      take,
    });
    // Chart data via efficient DB query
    const departmentStats = await this.getDepartmentStats();
    const employmentStats = await this.getEmploymentTypeStats();

    return {
      data: this.checkExpMultipleJob(jobs),
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
      departmentStats,
      employmentStats
    };
  }

  async getPaginatedJobApplications(page = 1, limit = 10) {
    const take = limit;
    const skip = (page - 1) * take;

    const [jobAppliants, total] = await this.jobApplicationRepository.findAndCount({
      relations: ["job", "userApplicant", "submission", "job.testId","job.testId.questions"],
      skip,
      take,
    });

    return {
      data: jobAppliants,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }


  // Get all jobs except the one that user have Not applied
  async getUnappliedJobs(userId: any): Promise<Job[]> {
    const jobs = await this.jobRepository
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
    return this.checkExpMultipleJob(jobs)
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
    this.checkExpiredJob(job)
    
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
