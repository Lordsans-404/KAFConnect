import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Services
import { JobsService } from '../jobs/jobs.service';
import { EvaluationService } from '../evaluation/evaluation.service';


@Injectable()
export class AdminService {
  constructor(
    private readonly jobsService: JobsService,
    private readonly evaluationService: EvaluationService,
  ) {}
  async adminPageJobs(page = 1, limit = 10){
    const jobs = await this.jobsService.getPaginatedJobs(page, limit);
    const all_tests = await this.evaluationService.getAllTests() // get all tests and add one to the job
    const materials = await this.jobsService.getAllMaterials(page=1,limit=100) // get all meterials and add to one job
    return {jobs,all_tests,materials}
  }

  async getAllStatsForDashboard(){
    const departmentStats = await this.jobsService.getDepartmentStats()
    const employmentStats = await this.jobsService.getEmploymentTypeStats()
    return {departmentStats,employmentStats}
  }
}
