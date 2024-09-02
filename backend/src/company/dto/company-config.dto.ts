import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import {
  IApiMapboxStyle,
  IApiUserExportFont,
  IApiPoiIcons,
  TAreaButlerExportTypes,
} from '@area-butler-types/types';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import { ICompanyConfig } from '@area-butler-types/company';
import { IIntUserExpMatchParams } from '@area-butler-types/integration-user';
import ApiUserExportFontDto from '../../user/dto/api-user-export-font.dto';
import ApiMapboxStyleDto from '../../dto/api-mapbox-style.dto';
import ApiPoiIconsDto from './api-poi-icons.dto';
import ExportMatchingDto from './export-matching.dto';

@Exclude()
class CompanyConfigDto implements ICompanyConfig {
  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(Iso3166_1Alpha2CountriesEnum, { each: true })
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];

  @Expose()
  @IsOptional()
  @IsString()
  color?: string;

  @Expose()
  @Type(() => ApiUserExportFontDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  exportFonts?: IApiUserExportFont[];

  @Expose()
  @Type(() => ExportMatchingDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  exportMatching?: Partial<
    Record<TAreaButlerExportTypes, IIntUserExpMatchParams>
  >;

  @Expose()
  @Type(() => ApiMapboxStyleDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  extraMapboxStyles?: IApiMapboxStyle[];

  @Expose()
  @IsOptional()
  @IsBoolean()
  isSpecialLink?: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  logo?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mapboxAccessToken?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mapIcon?: string;

  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @Type(() => ApiPoiIconsDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  poiIcons?: IApiPoiIcons;

  @Expose()
  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default CompanyConfigDto;
