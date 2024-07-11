import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  OsmName,
  OsmType,
  PoiGroupEnum,
  TPoiGroupName,
} from '@area-butler-types/types';

@Exclude()
class ApiOsmEntityDto implements ApiOsmEntity {
  @Expose()
  @IsNotEmpty()
  @IsEnum(ApiOsmEntityCategory)
  category: ApiOsmEntityCategory;

  @Expose()
  @IsNotEmpty()
  @IsIn([...Object.values(OsmName), ...Object.values(PoiGroupEnum)])
  groupName: TPoiGroupName;

  @Expose()
  @IsNotEmpty()
  @IsString()
  label: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(OsmName)
  name: OsmName;

  @Expose()
  @IsNotEmpty()
  @IsEnum(OsmType)
  type: OsmType;

  @Expose()
  @IsOptional()
  @IsString()
  id?: string;

  @Expose()
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  uniqueRadius?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  uniqueThreshold?: number;
}

export default ApiOsmEntityDto;
