import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException,
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { CreateUserDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(createUserDto: CreateUserDto & { 
    verifyToken?: string; 
    isVerified?: boolean 
  }): Promise<Users> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already exists
    const existingUser = await this.usersRepo.findOne({ 
      where: { email: createUserDto.email } 
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepo.create({
      ...rest,
      password: hashedPassword,
      verifyToken: createUserDto.verifyToken,
      isVerified: createUserDto.isVerified || false
    });

    return this.usersRepo.save(user);
  }

  async login(email: string, password: string): Promise<{ 
    access_token: string; 
    user: Partial<Users> 
  }> {
    const user = await this.usersRepo.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'name', 'level', 'isVerified']
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      level: user.level,
      isVerified: user.isVerified
    };

    return {
      access_token: this.generateJwt(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        level: user.level,
        isVerified: user.isVerified
      }
    };
  }

  generateJwt(payload: any): string {
    return this.jwtService.sign(payload);
  }

	async sendVerificationEmail(email: string, token: string) {
		const user = await this.usersRepo.findOne({ 
			where: { email },
			select: ['id', 'email', 'password', 'name', 'level', 'isVerified']
		});
		if (!user) {
		    throw new NotFoundException('User not found');
		}
		const verificationUrl = `${process.env.APP_URL}/users/verify-email?token=${token}`;
		await this.emailService.sendVerificationEmail(user.email,token);
	}

  	// Add these helper methods if not already present
	async findOne(conditions: any): Promise<Users | undefined> {
	  	const user = await this.usersRepo.findOne(conditions);
	  	return user || undefined; // Convert null to undefined
	}
  async save(user: Users): Promise<Users> {
    	return this.usersRepo.save(user);
  	}
}