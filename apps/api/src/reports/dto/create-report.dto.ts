import { IsString, IsEnum, IsNotEmpty, IsOptional, IsUrl } from 'class-validator'
import { ReportStatus } from '@prisma/client'

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsString()
  @IsNotEmpty()
  authorId: string

  @IsString()
  @IsNotEmpty()
  locationId: string

  @IsString()
  @IsNotEmpty()
  categoryId: string

  @IsUrl()
  @IsOptional()
  imageUrl?: string
}
