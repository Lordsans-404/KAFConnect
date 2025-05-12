import { Controller, Post, Req, Get, Body, Put, Param, ParseIntPipe, UseGuards, SetMetadata, ForbiddenException } from '@nestjs/common';
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
  @SetMetadata('roles', ['admin', 'staff'])
  async getProfile(@Req() req) {
    const user_profile = await this.usersService.profileByUserId(req.user.id )
    const users_by_profile = await this.usersService.getAllUsersWithProfiles()
    const all_users = await this.usersService.getAllRegisteredUsers()
    return {profile:user_profile,users_by_profile,all_users};
  }
  
  @Post()
  create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.adminService.createJob(createJobDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto
  ): Promise<Job> {
    return this.adminService.updateJob(id, updateJobDto);
  }
}
