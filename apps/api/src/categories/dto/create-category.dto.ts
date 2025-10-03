import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { CategoryType } from '@prisma/client'

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType

  @IsString()
  @IsOptional()
  description?: string
}
