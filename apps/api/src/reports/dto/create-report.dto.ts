import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
