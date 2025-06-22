import { Controller, Post, Req, Get, Body, Put, Logger, Query, Param, ParseIntPipe, UseGuards, SetMetadata, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateJobDto, UpdateJobDto } from '../jobs/dto/job.dto';
import { UpdateJobApplicationDto, CreateJobApplicationDto } from '../jobs/dto/createApplicationJob.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Job } from '../jobs/jobs.entity';
import { UsersService } from '../users/users.service';
import { JobsService } from '../jobs/jobs.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import { CreateTestDto, CreateChoiceDto, CreateQuestionDto } from '../evaluation/dto/create-test.dto' 


@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  	private readonly jobsService: JobsService,
    private readonly usersService: UsersService,
  	private readonly evaluationService: EvaluationService,
  ) {}

  @Get('dashboard')	
  @UseGuards(JwtAuthGuard,RolesGuard)
  @SetMetadata('roles', ['super_admin', 'admin', 'staff'])
  async getProfile(@Req() req) {
    const user_profile = await this.usersService.profileByUserId(req.user.id )
    const users_by_profile = await this.usersService.getAllUsersWithProfiles()
    const all_users = await this.usersService.getAllRegisteredUsers()
    const all_jobs = await this.jobsService.getAllJobs()
    const all_candidates = await this.jobsService.getAllApplicants()
    const all_tests = await this.evaluationService.getAllTests()
    return {profile:user_profile,users_by_profile,all_users,all_jobs,all_candidates,all_tests};
  }

  @Get('jobs') 
  @UseGuards(JwtAuthGuard,RolesGuard)
  @SetMetadata('roles', ['super_admin', 'admin', 'staff'])
  async getPaginatedJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '10', 10);

    return this.jobsService.getPaginatedJobs(pageNumber, limitNumber);
  }

  @Get('candidates') 
  @UseGuards(JwtAuthGuard,RolesGuard)
  @SetMetadata('roles', ['super_admin', 'admin', 'staff'])
  async getPaginatedJobApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '10', 10);

    return this.jobsService.getPaginatedJobApplications(pageNumber, limitNumber);
  }

  // Post
  @Post('new-job')
  @UseGuards(JwtAuthGuard,RolesGuard)  
  newJob(@Body() createJobDto: CreateJobDto){
    Logger.log("Posted")
    return this.jobsService.createJob(createJobDto);
  }

  @Post('new-test')
  async newTest(@Body() dto: CreateTestDto){
    return this.evaluationService.createTest(dto)
  }

  @Put('update-job/:id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  updateJob(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto
  ): Promise<Job> {
    return this.jobsService.updateJob(id, updateJobDto);
  }

  @Put('update-applicant/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateApplicant(
    @Param('id', ParseIntPipe) id:number,
    @Body() dto: UpdateJobApplicationDto
    ){
    return this.jobsService.updateApplication(id,dto)
  }


}
