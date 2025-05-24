import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException,
  NotFoundException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserProfile } from './users.entity';
import { CreateUserDto, RegisterResponseDto } from './dto/register.dto';
import { CreateUserProfileDto } from './dto/create-profile.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { JobsService } from '../jobs/jobs.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly jobsService: JobsService,
  ) {}

  // ==============================================
  // ENDPOINT SERVICE: dipanggil dari controller
  // ==============================================

  async register(createUserDto: CreateUserDto): Promise<RegisterResponseDto>{
    const verifyToken = crypto.randomBytes(20).toString('hex');

    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.userRepo.findOne({ 
      where: { email: createUserDto.email } 
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const createUser = this.userRepo.create({
      ...rest,
      password: hashedPassword,
      verifyToken: verifyToken,
      isVerified: false
    });
    const savedUser = await this.userRepo.save(createUser);
    const payload = { 
      email: savedUser.email, 
      sub: savedUser.id,
      isVerified: false // Important to include verification status
    }
    return{
      ...savedUser,
      access_token : await this.generateJwt(payload),
    };
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

  async dashboardService(req: any) {
    const profile = await this.profileByUserId(req.id);
    const jobs = await this.jobsService.getAllJobs();
    return { profile, jobs };
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
    await this.emailService.sendVerificationEmail(user.email, token);
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

  // ========================================
  // INTERNAL SERVICE
  // ========================================

  generateJwt(payload: any): string {
    return this.jwtService.sign(payload);
  }

  async userFindOne(conditions: any): Promise<User | undefined> {
    const user = await this.userRepo.findOne(conditions);
    return user || undefined;
  }

  async profileFindOne(conditions: any): Promise<UserProfile | undefined> {
    const profile = await this.userProfileRepository.findOne(conditions);
    return profile || undefined;
  }

  async getAllUsersWithProfiles() {
    return this.userProfileRepository.find({
      relations: ['user'],
    }) || undefined;
  }

  async getAllRegisteredUsers() {
    return this.userRepo.find() || undefined;
  }

  async profileByUserId(userId: number) {
    return this.userProfileRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          level: true,
          isVerified: true,
        },
      }
    });
  }

  async save(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
}
