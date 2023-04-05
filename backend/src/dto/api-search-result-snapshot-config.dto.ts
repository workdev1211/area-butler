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
  IsString,
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
  @IsNotEmpty()
  @IsBoolean()
  showLocation: boolean;

  @IsNotEmpty()
  @IsBoolean()
  groupItems: boolean;

  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @IsOptional()
  @IsBoolean()
  showStreetViewLink?: boolean;

  @IsOptional()
  @IsBoolean()
  showDetailsInOnePage?: boolean;

  @IsOptional()
  @IsBoolean()
  hideIsochrones?: boolean;

  @IsOptional()
  @IsBoolean()
  hideMeanToggles?: boolean;

  @IsOptional()
  @IsBoolean()
  hideMapMenu?: boolean;

  @IsOptional()
  @IsBoolean()
  hidePoiIcons?: boolean;

  @IsOptional()
  @IsString()
  mapBoxMapId?: string;

  @IsOptional()
  @IsIn(['DEFAULT', 'KF'])
  theme?: ApiSearchResultSnapshotConfigTheme;

  @IsOptional()
  @IsString()
  mapIcon?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsNumber()
  zoomLevel?: number;

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

  @IsOptional()
  @IsEnum(ApiRealEstateStatusEnum)
  @NotEquals(ApiRealEstateStatusEnum.ALLE)
  realEstateStatus?: ApiRealEstateStatusEnum;

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
