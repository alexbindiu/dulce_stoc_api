import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export const BUSINESS_TYPES = ['Patiserie', 'Cofetărie', 'Brutărie', 'Altele'] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Prenumele este obligatoriu.' })
  @MinLength(2, { message: 'Prenumele trebuie să aibă minim 2 caractere.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Numele este obligatoriu.' })
  @MinLength(2, { message: 'Numele trebuie să aibă minim 2 caractere.' })
  lastName: string;

  @IsEmail({}, { message: 'Email invalid.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Parola este obligatorie.' })
  @MinLength(8, { message: 'Parola trebuie să aibă minim 8 caractere.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Numele afacerii este obligatoriu.' })
  businessName: string;

  @IsIn(BUSINESS_TYPES, { message: 'Tip de afacere invalid.' })
  businessType: BusinessType;

  @IsString()
  @IsNotEmpty({ message: 'Județul este obligatoriu.' })
  county: string;
}
