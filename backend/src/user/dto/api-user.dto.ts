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
  IApiUserExportFont,
  IApiUserParentSettings,
  IApiUserPoiIcons,
  MapBoxStyle,
  TApiUserApiConnections,
} from '@area-butler-types/types';
import ApiRequestContingentDto from './api-request-contingent.dto';
import ApiShowTourDto from './api-show-tour.dto';
import ApiUserSubscriptionDto from './api-user-subscription.dto';
import MapBoxStyleDto from '../../dto/map-box-style.dto';
import { mapSubscriptionToApiSubscription } from '../mapper/subscription.mapper';
import { retrieveTotalRequestContingent } from '../schema/user.schema';
import ApiUserParentSettingsDto from './api-user-parent-settings.dto';
import ApiUserExportFontDto from './api-user-export-font.dto';
import ApiUserPoiIconsDto from './api-user-poi-icons.dto';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import {
  ApiRequestContingent,
  ApiUserSubscription,
} from '@area-butler-types/subscription-plan';

@Exclude()
class ApiUserDto implements ApiUser {
  @Expose()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MapBoxStyleDto)
  additionalMapBoxStyles: MapBoxStyle[];

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
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiRequestContingentDto)
  @Transform(
    ({ obj }) => retrieveTotalRequestContingent(obj.parentUser || obj),
    {
      toClassOnly: true,
    },
  )
  requestContingents: ApiRequestContingent[];

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @Transform(
    ({ obj: { parentUser, requestsExecuted } }) =>
      parentUser?.requestsExecuted || requestsExecuted,
    { toClassOnly: true },
  )
  requestsExecuted: number;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiShowTourDto)
  showTour: ApiShowTour;

  @Expose({ name: 'subscription', toClassOnly: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiUserSubscriptionDto)
  @Transform(
    ({ obj: { subscription } }) =>
      subscription ? mapSubscriptionToApiSubscription(subscription) : null,
    { toClassOnly: true },
  )
  subscription?: ApiUserSubscription;

  @Expose({ name: 'parentId' })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => !!value, { toClassOnly: true })
  isChild: boolean;

  // TODO change it to the new API request
  @Expose()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ApiUserParentSettingsDto)
  @Transform(
    ({ obj: { parentUser } }) =>
      parentUser
        ? {
            color: parentUser.color,
            logo: parentUser.logo,
            mapIcon: parentUser.mapIcon,
            exportFonts: parentUser.exportFonts,
          }
        : undefined,
    { toClassOnly: true },
  )
  parentSettings?: IApiUserParentSettings;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiUserPoiIconsDto)
  poiIcons?: IApiUserPoiIcons;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiUserExportFontDto)
  exportFonts?: IApiUserExportFont[];

  // TODO add a separate type
  @Expose()
  @IsOptional()
  @IsObject()
  apiConnections?: TApiUserApiConnections;

  @Expose()
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
