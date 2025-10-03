import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateReportDto } from './create-report.dto';
import { ReportStatus } from '@prisma/client';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;
}
