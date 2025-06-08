import { 
  Controller, 
  Post, 
  Get,
  Patch, 
  Body, 
  Query, 
  HttpCode,
  HttpStatus,
  UseGuards,
  Redirect,
  Req,
  Logger,
  Param, ParseIntPipe,
  BadRequestException,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,

} from '@nestjs/common';
import { UsersService } from './users.service';
import { JobsService } from '../jobs/jobs.service';
import { CreateUserDto } from './dto/register.dto';
import { CreateUserProfileDto, UpdateUserProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
    ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    // Register user with verification token
    const register = await this.usersService.register({
      ...createUserDto,
    });
    return register
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const { access_token, user } = await this.usersService.login(body.email, body.password);
    var next_url;
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.level === "basic"){
      next_url = "/profile";
    }
    else{
      next_url = "/admin/dashboard";
    }

    // Include verification status in response
    return {
      access_token,
      user: {
        ...user,
        isVerified: user.isVerified
      },
      url: next_url
    };
  }

  @Get('verify-email')
  @Redirect('http://localhost:3001/profile', 301)
  async verifyEmail(@Query('token') token: string) {
    const user = await this.usersService.userFindOne({ where: { verifyToken: token } });
    
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token!');
    }

    // Mark as verified and clear token
    user.isVerified = true;
    user.verifyToken = "";
    await this.usersService.save(user);

    return { 
      success: true,
      message: 'Email successfully verified!'
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    const user = await this.usersService.userFindOne({ 
      where: { email: req.user.email },
      select: ['id', 'email', 'name', 'isVerified', 'level'] 
    });
    const user_profile = await this.usersService.profileFindOne({
      where: { user: { id: req.user.id } }
    });
    return {user:user,profile:user_profile};
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@Req() req){
    return this.usersService.dashboardService(req.user)
  }

  @Post('apply-job')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/resume-user',
      filename: (req, file, cb) => {
        const userId = req.user?.id; // Get user ID from the request
        const jobId = req.body?.jobId; // Get job ID from the body
        const uniqueSuffix = Date.now();
        const fileExtName = extname(file.originalname);
        const newFilename = `user-${userId}-job-${jobId}-${uniqueSuffix}${fileExtName}`;
        cb(null, newFilename);
      },
    }),
  }))
  async applyJob(
      @Req() req,
      @Body() body:any,
      @UploadedFile() file: Express.Multer.File
    ){
    const userId = req.user.id;
    const dto = {
      jobId: parseInt(body.jobId, 10), // karena dari FormData, semua string
      coverLetter: body.coverLetter,
      applicantId: userId,
      resumePath: file.path, // asumsi kamu simpan path file
    };
    return this.jobsService.userApplyJob(dto)
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    const user = await this.usersService.userFindOne({ where: { email: body.email } });
    Logger.log(body.email)
    
    if (!user) {
      Logger.log("Email Not Found")
      throw new BadRequestException('No account found with this email');
    }

    if (user.isVerified) {
      Logger.log("Udh Verified Woy!!");
      throw new BadRequestException('Email is already verified');
    }

    // Generate new token if none exists
    const newToken = user.verifyToken || crypto.randomBytes(20).toString('hex');
    user.verifyToken = newToken;
    await this.usersService.save(user);

    await this.usersService.sendVerificationEmail(user.email, newToken);
    Logger.log("Verification email resent successfully ")
    return {
      success: true,
      message: 'Verification email resent successfully'
    };
  }
  
  @Post('profile/:userId')
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createDto: CreateUserProfileDto,
    ) {
    const userProfile = await this.usersService.createUserProfile(createDto, userId);
    return{
      success: true,
      message: 'Profile successfully created!'
    } 
  }
  @Patch('profile/:userId')
  async updateProfile(@Param('userId', ParseIntPipe) userId: number,
    @Body() updateDto: UpdateUserProfileDto){
    const updated = await this.usersService.updateProfile(userId, updateDto);
    return {
      message: 'Profile updated successfully',
      data: updated,
    };
  }

}