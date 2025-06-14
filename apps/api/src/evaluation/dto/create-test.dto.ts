import { IsString, IsBoolean, IsArray, IsInt, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChoiceDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect?: boolean; // tidak wajib dari frontend, hanya untuk admin
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceDto)
  choices: CreateChoiceDto[];
}

export class CreateTestDto {
  @IsString()
  title: string;

  @IsInt()
  createdBy: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
