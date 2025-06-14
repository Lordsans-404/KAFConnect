// submit-test.dto.ts
import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsInt()
  questionId: number;

  @IsInt()
  choiceId: number;
}

export class SubmitTestDto {
  @IsInt()
  testId: number;

  @IsInt()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
