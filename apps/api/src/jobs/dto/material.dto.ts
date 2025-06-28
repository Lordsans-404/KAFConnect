import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty({ message: 'Need Title For Material.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Please fill the description!' })
  description: string;

  @IsOptional()
  @IsString()
  materialPath?: string;

  @IsOptional()
  @IsUrl({}, { message: 'It must contain valid url' })
  materialUrl?: string;

}
