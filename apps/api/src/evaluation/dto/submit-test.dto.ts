// submit-test.dto.ts
import { IsInt, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsInt()
  question: number;

  @IsInt()
  selectedChoice: number;
}

export class SubmitTestDto {
  @IsInt()
  test: number;

  @IsInt()
  user: number;

  @IsInt()
  jobApplicationId:number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
