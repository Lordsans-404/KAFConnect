import { 
  Controller, 
  Post, 
  Get, 
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
  UnauthorizedException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/register.dto';
import { CreateUserProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as crypto from 'crypto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // Register user with verification token
    const user = await this.usersService.register({
      ...createUserDto,
      verifyToken: verificationToken,
      isVerified: false
    });

    // Send verification email
    // await this.usersService.sendVerificationEmail(user.email, verificationToken);

    // Return user with access token (optional immediate login)
    const payload = { 
      email: user.email, 
      sub: user.id,
      isVerified: false // Important to include verification status
    };
    
    return {
      ...user,
      access_token: this.usersService.generateJwt(payload),
      message: 'Registration successful! Please check your email to verify your account.'
    };
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
}