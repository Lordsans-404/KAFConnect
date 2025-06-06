import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../jobs.entity'; // Sesuaikan path jika berbeda

export class CreateJobApplicationDto {
  @IsNotEmpty()
  jobId: number;

  @IsNotEmpty()
  applicantId: number;

  @IsOptional()
  @IsString()
  resumePath?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
