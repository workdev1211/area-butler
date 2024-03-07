import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform, Expose, Exclude } from 'class-transformer';

import {
  ApiShowTour,
  ApiUser,
  IApiMapboxStyle,
  IApiUserExportFont,
  IApiUserPoiIcons,
  TApiUserApiConnections,
} from '@area-butler-types/types';
import ApiRequestContingentDto from './api-request-contingent.dto';
import ApiShowTourDto from './api-show-tour.dto';
import ApiUserSubscriptionDto from './api-user-subscription.dto';
import { mapSubscriptionToApiSubscription } from '../mapper/subscription.mapper';
import {
  retrieveTotalRequestContingent,
  UserDocument,
} from '../schema/user.schema';
import ApiUserExportFontDto from './api-user-export-font.dto';
import ApiUserPoiIconsDto from './api-user-poi-icons.dto';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import {
  ApiRequestContingent,
  ApiUserSubscription,
} from '@area-butler-types/subscription-plan';
import ApiMapboxStyleDto from '../../dto/api-mapbox-style.dto';
import ApiUserApiConnectionsDto from './api-user-api-connections.dto';
import { getUnitedMapboxStyles } from '../../shared/functions/shared';
import { SubscriptionDocument } from '../schema/subscription.schema';

@Exclude()
class ApiUserDto implements ApiUser {
  @Expose()
  @Type(() => ApiMapboxStyleDto)
  @Transform(
    ({
      value,
      obj: { parentUser },
    }: {
      obj: UserDocument;
      value: IApiMapboxStyle[];
    }): IApiMapboxStyle[] =>
      getUnitedMapboxStyles(parentUser?.additionalMapBoxStyles, value),
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  extraMapboxStyles: IApiMapboxStyle[];

  @Expose()
  @IsOptional()
  @IsString()
  color?: string;

  @Expose()
  @IsOptional()
  @IsDate()
  consentGiven?: Date;

  @Expose()
  @IsNotEmpty()
  @IsString()
  email: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @Expose()
  @IsOptional()
  @IsString()
  logo?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mapIcon?: string;

  @Expose()
  @Type(() => ApiRequestContingentDto)
  @Transform(
    ({ obj }: { obj: UserDocument }): ApiRequestContingent[] =>
      retrieveTotalRequestContingent(obj.parentUser || obj),
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  requestContingents: ApiRequestContingent[];

  @Expose()
  @Transform(
    ({
      value,
      obj: { parentUser },
    }: {
      obj: UserDocument;
      value: number;
    }): number => parentUser?.requestsExecuted || value,
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsNumber()
  requestsExecuted: number;

  @Expose()
  @Type(() => ApiShowTourDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  showTour: ApiShowTour;

  @Expose()
  @Type(() => ApiUserSubscriptionDto)
  @Transform(
    ({ value }: { value: SubscriptionDocument }): ApiUserSubscription =>
      value ? mapSubscriptionToApiSubscription(value) : null,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  subscription?: ApiUserSubscription;

  @Expose({ name: 'parentId', toClassOnly: true })
  @Transform(({ value }: { value: boolean }): boolean => !!value, {
    toClassOnly: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isChild: boolean;

  @Expose()
  @Type(() => ApiUserPoiIconsDto)
  @Transform(
    ({
      value,
      obj: { parentUser },
    }: {
      obj: UserDocument;
      value: IApiUserPoiIcons;
    }): IApiUserPoiIcons => value || parentUser?.poiIcons,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  poiIcons?: IApiUserPoiIcons;

  @Expose()
  @Type(() => ApiUserExportFontDto)
  @Transform(
    ({
      value,
      obj: { parentUser },
    }: {
      obj: UserDocument;
      value: IApiUserExportFont[];
    }): IApiUserExportFont[] => value || parentUser?.exportFonts,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  exportFonts?: IApiUserExportFont[];

  @Expose()
  @Type(() => ApiUserApiConnectionsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  apiConnections?: TApiUserApiConnections;

  @Expose()
  @Transform(
    ({
      value,
      obj: { parentUser },
    }: {
      obj: UserDocument;
      value: Iso3166_1Alpha2CountriesEnum[];
    }): Iso3166_1Alpha2CountriesEnum[] => value || parentUser?.allowedCountries,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsArray()
  @IsEnum(Iso3166_1Alpha2CountriesEnum, { each: true })
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];

  @Expose()
  @IsOptional()
  @IsString()
  templateSnapshotId?: string;
}

export default ApiUserDto;
