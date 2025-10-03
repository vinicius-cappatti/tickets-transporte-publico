import { IsEmail, IsString, IsEnum, IsNotEmpty, MinLength } from 'class-validator'
import { UserRole } from '@prisma/client'

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole
}
