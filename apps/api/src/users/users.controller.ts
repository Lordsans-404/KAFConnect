import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Query, 
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/register.dto';
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
    await this.usersService.sendVerificationEmail(user.email, verificationToken);

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

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Include verification status in response
    return {
      access_token,
      user: {
        ...user,
        isVerified: user.isVerified
      },
      needsVerification: !user.isVerified
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.usersService.findOne({ where: { verifyToken: token } });
    
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
  getProfile(@Req() req) {
    return {
      name: req.user.name,
      email: req.user.email,
      level: req.user.level || 'basic',
      isVerified: req.user.isVerified // Include verification status
    };
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    const user = await this.usersService.findOne({ where: { email: body.email } });
    
    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new token if none exists
    const newToken = user.verifyToken || crypto.randomBytes(20).toString('hex');
    user.verifyToken = newToken;
    await this.usersService.save(user);

    await this.usersService.sendVerificationEmail(user.email, newToken);
    console.log("Verification email resent successfully ")
    return {
      success: true,
      message: 'Verification email resent successfully'
    };
  }
}