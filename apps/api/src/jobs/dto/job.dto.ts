import { IsEnum, IsOptional, IsString } from 'class-validator';
export enum EmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship'
}

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  requirements: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  salaryRange?: string;

  @IsOptional()
  postedByUser?: any; // Set by backend if needed

  @IsOptional()
  closingDate?: Date;

  @IsOptional()
  testId?:any;

  @IsOptional()
  material?:any

  @IsOptional()
  isActive?: boolean;
}

export class UpdateJobDto extends CreateJobDto {}
