import {
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsIn,
  IsNumber,
  NotEquals,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  IApiSnapshotIconSizes,
  IApiSnapshotPoiFilter,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiSnippetEntityVisibilityDto from './api-snippet-entity-visiblity.dto';
import { ApiRealEstateStatusEnum } from '@area-butler-types/real-estate';
import ApiSnapshotIconSizesDto from './api-snapshot-icon-sizes.dto';
import ApiSnapshotPoiFilterDto from './api-snapshot-poi-filter.dto';

class ApiSearchResultSnapshotConfigDto
  implements ApiSearchResultSnapshotConfig
{
  @IsOptional()
  @IsArray()
  defaultActiveGroups?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(MeansOfTransportation, { each: true })
  defaultActiveMeans?: MeansOfTransportation[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiSnippetEntityVisibilityDto)
  entityVisibility?: ApiSnippetEntityVisibilityDto[];

  @IsOptional()
  @IsBoolean()
  fixedRealEstates?: boolean;

  @IsNotEmpty()
  @IsBoolean()
  groupItems: boolean;

  @IsOptional()
  mapBoxMapId?: string;

  @IsOptional()
  mapIcon?: string;

  @IsOptional()
  primaryColor?: string;

  @IsNotEmpty()
  @IsBoolean()
  showLocation: boolean;

  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @IsOptional()
  @IsIn(['DEFAULT', 'KF'])
  theme?: ApiSearchResultSnapshotConfigTheme;

  @IsOptional()
  @IsBoolean()
  showStreetViewLink?: boolean;

  @IsOptional()
  @IsNumber()
  zoomLevel?: number;

  @IsOptional()
  @IsEnum(ApiRealEstateStatusEnum)
  @NotEquals(ApiRealEstateStatusEnum.ALLE)
  realEstateStatus?: ApiRealEstateStatusEnum;

  @IsOptional()
  @IsBoolean()
  showDetailsInOnePage?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSnapshotPoiFilterDto)
  poiFilter?: IApiSnapshotPoiFilter;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiSnapshotIconSizesDto)
  iconSizes?: IApiSnapshotIconSizes;
}

export default ApiSearchResultSnapshotConfigDto;
