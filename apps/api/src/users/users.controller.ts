import { Controller, Post, Get, Req, Body, Res, HttpStatus, HttpCode, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		) {}

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(@Body() createUserDto: CreateUserDto) {
		const user = await this.usersService.register(createUserDto);
    // Optionally log the user in immediately after registration
		const payload = { email: user.email, sub: user.id };
		return {
			...user,
			access_token: this.jwtService.sign(payload),
		};
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() body: { email: string; password: string }) {
		const { access_token, user } = await this.usersService.login(body.email, body.password);

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const payload = {  sub: user.id, email: user.email, name: user.name, level: user.level,  };
		return {
			access_token: this.jwtService.sign(payload, {
				secret: this.configService.get<string>('JWT_SECRET'),
				expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '60m',
			})
		};
	}
	@Get('profile')
	@UseGuards(JwtAuthGuard)
	getProfile(@Req() req) {
    // req.user berasal dari payload JWT
		console.log(req.user);
		return {
			name: req.user.name,
			email: req.user.email,
      		level: req.user.level || 'basic', // default jika tidak ada level
      	}
  	}

}