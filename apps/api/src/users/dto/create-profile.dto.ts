import { IsString, Length, IsOptional, Matches } from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  @Length(10, 15)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain digits only' })
  phoneNumber: string;

  @IsString()
  @Length(16, 16, { message: 'ID Card Number must be exactly 16 digits' })
  @Matches(/^[0-9]+$/, { message: 'ID Card Number must contain digits only' })
  idCardNumber: string;

  @IsString()
  @Length(5, 255)
  address: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  stateProvince?: string;

  @IsOptional()
  @IsString()
  @Length(5, 5, { message: 'Postal code must be 5 digits' })
  @Matches(/^[0-9]+$/, { message: 'Postal code must contain digits only' })
  postalCode?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  bio?: string;
}
