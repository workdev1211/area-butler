import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  OsmName,
  OsmType,
} from '@area-butler-types/types';

class ApiOsmEntityDto implements ApiOsmEntity {
  @IsNotEmpty()
  @IsEnum(ApiOsmEntityCategory)
  category: ApiOsmEntityCategory;

  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsEnum(OsmName)
  name: OsmName;

  @IsNotEmpty()
  @IsEnum(OsmType)
  type: OsmType;

  @IsOptional()
  @IsNumber()
  uniqueRadius?: number;

  @IsOptional()
  @IsNumber()
  uniqueThreshold?: number;
}

export default ApiOsmEntityDto;
