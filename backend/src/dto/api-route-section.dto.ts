import { ApiRouteSection } from '@area-butler-types/routing';
import ApiGeometryDto from './api-geometry.dto';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested, IsNumber, IsOptional } from 'class-validator';


class ApiRouteSectionDto implements ApiRouteSection {

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiGeometryDto)
  geometry: ApiGeometryDto;

  @IsNotEmpty()
  @IsNumber()
  length: number;

  @IsNotEmpty()
  transportMode: string;

  @IsOptional()
  type?: string;
}

export default ApiRouteSectionDto;
