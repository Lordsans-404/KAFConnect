import { Injectable, ConflictException, UnauthorizedException, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { CreateUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(Users)
		private readonly usersRepo: Repository<Users>,
		private readonly jwtService: JwtService,
	) {}

	async register(createUserDto: CreateUserDto): Promise<Users> {
		const { password, ...rest } = createUserDto;
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = this.usersRepo.create({
			...rest,
			password: hashedPassword,
		});

		return this.usersRepo.save(user);
	}

	async login(email: string, password: string): Promise<{ access_token: string; user: Partial<Users> }> {
		const user = await this.usersRepo.findOne({ where: { email } });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new UnauthorizedException('Invalid email or password');
		}

		const payload = {
			sub: user.id,
			email: user.email,
			name: user.name,
			level: user.level,
		};

		const access_token = this.jwtService.sign(payload, {
			secret: process.env.JWT_SECRET,
		});

		const { id, email: userEmail, name, level } = user;

		return {
			access_token,
			user: { id, email: userEmail, name, level },
		};
	}
}
