import { IsNotEmpty, IsString, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 5)
  code: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}
