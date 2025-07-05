// NestJS core
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  SetMetadata,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// Guards
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

// Services
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { JobsService } from '../jobs/jobs.service';
import { EvaluationService } from '../evaluation/evaluation.service';

// DTOs
import { CreateJobDto, UpdateJobDto } from '../jobs/dto/job.dto';
import {
  CreateJobApplicationDto,
  UpdateJobApplicationDto,
} from '../jobs/dto/createApplicationJob.dto';
import { CreateMaterialDto } from '../jobs/dto/material.dto';
import {
  CreateTestDto,
  CreateChoiceDto,
  CreateQuestionDto,
} from '../evaluation/dto/create-test.dto';

// Entities
import { Job } from '../jobs/jobs.entity';

// Utils
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';


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
    return this.adminService.adminPageJobs(pageNumber,limitNumber)
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

  @Get('users-profile')
  async getUserProfiles(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.usersService.getPaginatedUserProfiles(pageNum, limitNum);
  }

  @Get('materials')
  async getMaterials(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.jobsService.getAllMaterials(pageNum, limitNum);
  }

  // Post
  @Post('new-job')
  @UseGuards(JwtAuthGuard,RolesGuard)  
  newJob(@Body() createJobDto: CreateJobDto){
    Logger.log("Posted")
    return this.jobsService.createJob(createJobDto);
  }

  @Post('new-test')
  @UseGuards(JwtAuthGuard,RolesGuard)  
  async newTest(@Body() dto: CreateTestDto){
    return this.evaluationService.createTest(dto)
  }

  @Post('new-material')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @UseInterceptors(FileInterceptor('file',{
    storage: diskStorage({
      destination: './uploads/materials',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        const fileExtName = extname(file.originalname);
        const safeTitle = req.body?.title?.replace(/\s+/g, '_') || 'material';
        cb(null, `${safeTitle}-${uniqueSuffix}${fileExtName}`);
      },
    }),
  }))
  async createMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMaterialDto,
  ) {
    const dto: CreateMaterialDto = {
      ...body,
      materialPath: file?.path || undefined,
    };
    return this.jobsService.createMaterial(dto);
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
