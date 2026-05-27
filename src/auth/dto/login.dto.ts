import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalid.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Parola este obligatorie.' })
  password: string;
}
