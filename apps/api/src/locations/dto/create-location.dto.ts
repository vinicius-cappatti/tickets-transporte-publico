import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsNumber()
  @IsNotEmpty()
  latitude: number

  @IsNumber()
  @IsNotEmpty()
  longitude: number

  @IsString()
  @IsNotEmpty()
  type: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  adminId?: string
}
