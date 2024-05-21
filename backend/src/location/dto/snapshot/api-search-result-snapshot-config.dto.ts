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
import { Exclude, Expose, Type } from 'class-transformer';

import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotConfigTheme,
  IApiSnapshotConfigRealEstSettings,
  IApiSnapshotIconSizes,
  IApiSnapshotPoiFilter,
  MeansOfTransportation,
} from '@area-butler-types/types';
import ApiSnippetEntityVisibilityDto from '../../../dto/api-snippet-entity-visiblity.dto';
import ApiSnapshotIconSizesDto from '../../../dto/api-snapshot-icon-sizes.dto';
import ApiSnapshotPoiFilterDto from '../../../dto/api-snapshot-poi-filter.dto';
import { realEstateAllStatus } from '../../../../../shared/constants/real-estate';
import ApiSnapshotConfigRealEstSettingsDto from './api-snapshot-poi-filter.dto';

@Exclude()
class ApiSearchResultSnapshotConfigDto
  implements ApiSearchResultSnapshotConfig
{
  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultActiveGroups?: string[];

  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(MeansOfTransportation, { each: true })
  defaultActiveMeans?: MeansOfTransportation[];

  @Expose()
  @Type(() => ApiSnippetEntityVisibilityDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  entityVisibility?: ApiSnippetEntityVisibilityDto[];

  @Expose()
  @IsOptional()
  @IsBoolean()
  groupItems?: boolean;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hiddenGroups?: string[];

  @Expose()
  @IsOptional()
  @IsBoolean()
  hideIsochrones?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  hideMeanToggles?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  hideMapMenu?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  hidePoiIcons?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isDetailsShown?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isFilterMenuAvail?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isMapMenuCollapsed?: boolean;

  @Expose()
  @Type(() => ApiSnapshotIconSizesDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  iconSizes?: IApiSnapshotIconSizes;

  @Expose()
  @IsOptional()
  @IsString()
  mapBoxMapId?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mapIcon?: string;

  @Expose()
  @Type(() => ApiSnapshotPoiFilterDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  poiFilter?: IApiSnapshotPoiFilter;

  @Expose()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Expose()
  @Type(() => ApiSnapshotConfigRealEstSettingsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  realEstateSettings?: IApiSnapshotConfigRealEstSettings;

  @Expose()
  @IsOptional()
  @IsString()
  @NotEquals(realEstateAllStatus)
  realEstateStatus?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @NotEquals(realEstateAllStatus)
  realEstateStatus2?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  showLocation?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  showStreetViewLink?: boolean;

  @Expose()
  @IsOptional()
  @IsIn(['DEFAULT', 'KF'])
  theme?: ApiSearchResultSnapshotConfigTheme;

  @Expose()
  @IsOptional()
  @IsNumber()
  zoomLevel?: number;
}

export default ApiSearchResultSnapshotConfigDto;
