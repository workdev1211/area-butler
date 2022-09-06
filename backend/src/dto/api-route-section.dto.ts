import {
  IsNotEmpty,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ApiRouteSection } from '@area-butler-types/routing';
import ApiGeometryDto from './api-geometry.dto';
import { ApiGeometry } from '@area-butler-types/types';

class ApiRouteSectionDto implements ApiRouteSection {
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiGeometryDto)
  geometry: ApiGeometry;

  @IsNotEmpty()
  @IsNumber()
  length: number;

  @IsNotEmpty()
  @IsString()
  transportMode: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export default ApiRouteSectionDto;
