import {
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
import ApiSnippetEntityVisibilityDto from '../../../dto/api-snippet-entity-visiblity.dto';
import ApiSnapshotIconSizesDto from '../../../dto/api-snapshot-icon-sizes.dto';
import ApiSnapshotPoiFilterDto from '../../../dto/api-snapshot-poi-filter.dto';
import { realEstateAllStatus } from '../../../../../shared/constants/real-estate';

class ApiSearchResultSnapshotConfigDto
  implements ApiSearchResultSnapshotConfig
{
  @IsOptional()
  @IsBoolean()
  showLocation?: boolean;

  @IsOptional()
  @IsBoolean()
  groupItems?: boolean;

  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @IsOptional()
  @IsBoolean()
  showStreetViewLink?: boolean;

  @IsOptional()
  @IsBoolean()
  isDetailsShown?: boolean;

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
  @IsString()
  @NotEquals(realEstateAllStatus)
  realEstateStatus?: string;

  @IsOptional()
  @IsString()
  realEstateStatus2?: string;

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

  @IsOptional()
  @IsBoolean()
  isMapMenuCollapsed?: boolean;
}

export default ApiSearchResultSnapshotConfigDto;
