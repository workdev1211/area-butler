import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  OsmName,
  OsmType
} from '@area-butler-types/types';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

class ApiOsmEntityDto implements ApiOsmEntity {

  @IsNotEmpty()
  @IsEnum(ApiOsmEntityCategory)
  category: ApiOsmEntityCategory;

  @IsOptional()
  id?: string;

  @IsNotEmpty()
  label: string;

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
  uniqueTreshold?: number;
}

export default ApiOsmEntityDto;
