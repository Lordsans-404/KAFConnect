// create-user.dto.ts
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserLevel } from '../users.entity';

export class CreateUserDto {
  @IsString() 
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserLevel)
  level?: UserLevel; // optional, defaults to 'basic'
}

// Untuk type response register
export class RegisterResponseDto {
  id: number;
  email: string;
  isVerified: boolean;
  access_token: string;
}