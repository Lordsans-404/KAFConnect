import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException,
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProfile } from './users.entity';
import { CreateUserDto } from './dto/register.dto';
import { CreateUserProfileDto } from './dto/create-profile.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(createUserDto: CreateUserDto & { 
    verifyToken?: string; 
    isVerified?: boolean 
  }): Promise<User> {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already exists
    const existingUser = await this.userRepo.findOne({ 
      where: { email: createUserDto.email } 
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepo.create({
      ...rest,
      password: hashedPassword,
      verifyToken: createUserDto.verifyToken,
      isVerified: createUserDto.isVerified || false
    });

    return this.userRepo.save(user);
  }

  async login(email: string, password: string): Promise<{ 
    access_token: string; 
    user: Partial<User> 
  }> {
    const user = await this.userRepo.findOne({ 
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
		const user = await this.userRepo.findOne({ 
			where: { email },
			select: ['id', 'email', 'password', 'name', 'level', 'isVerified']
		});
		if (!user) {
		    throw new NotFoundException('User not found');
		}
		const verificationUrl = `${process.env.APP_URL}/users/verify-email?token=${token}`;
		await this.emailService.sendVerificationEmail(user.email,token);
	}

  async createUserProfile(createDto: CreateUserProfileDto, userId: number): Promise<UserProfile> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = this.userProfileRepository.create({
      ...createDto,
      user,
    });

    return this.userProfileRepository.save(profile);
  }


  // Add these helper methods if not already present
	async userFindOne(conditions: any): Promise<User | undefined> {
	  	const user = await this.userRepo.findOne(conditions);
	  	return user || undefined; // Convert null to undefined
	}

  async profileFindOne(conditions: any): Promise<UserProfile | undefined> {
      const profile = await this.userProfileRepository.findOne(conditions);
      return profile || undefined; // Convert null to undefined
  }

  async getAllUsersWithProfiles() {
    return this.userProfileRepository.find({
      relations: ['user'],
    }) || undefined;
  }

  async getAllRegisteredUsers() {
    return this.userRepo.find() || undefined;
  }

  // Untuk mendapatkan User dan Profile sekaligus
  async profileByUserId(userId: number) {
    return this.userProfileRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });
  }

  async save(user: User): Promise<User> {
    	return this.userRepo.save(user);
  	}
}