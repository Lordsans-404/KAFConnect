import { Controller, Post, Req, Get, Body, Put, Logger, Param, ParseIntPipe, UseGuards, SetMetadata, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Job } from '../jobs/jobs.entity';
import { UsersService } from '../users/users.service';


@Controller('admin')
export class AdminController {
  constructor(
  	private readonly adminService: AdminService,
  	private readonly usersService: UsersService
  ) {}

  @Get('dashboard')	
  @UseGuards(JwtAuthGuard,RolesGuard)
  @SetMetadata('roles', ['super_admin', 'admin', 'staff'])
  async getProfile(@Req() req) {
    const user_profile = await this.usersService.profileByUserId(req.user.id )
    const users_by_profile = await this.usersService.getAllUsersWithProfiles()
    const all_users = await this.usersService.getAllRegisteredUsers()
    const all_jobs = await this.adminService.getAllJobs()
    return {profile:user_profile,users_by_profile,all_users,all_jobs};
  }
  
  @Post('new-job')
  @UseGuards(JwtAuthGuard,RolesGuard)  
  newJob(@Body() createJobDto: CreateJobDto){
    Logger.log("Posted")
    return this.adminService.createJob(createJobDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto
  ): Promise<Job> {
    return this.adminService.updateJob(id, updateJobDto);
  }
}
