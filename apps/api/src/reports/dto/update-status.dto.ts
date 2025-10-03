import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { ReportStatus } from '@prisma/client'

export class UpdateStatusDto {
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus

  @IsString()
  @IsNotEmpty()
  updatedBy: string

  @IsString()
  @IsOptional()
  comment?: string
}
