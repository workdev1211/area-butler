import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform, Expose, Exclude } from 'class-transformer';

import {
  ApiUser,
  IApiUserExportFont,
  IApiUserPoiIcons,
  TApiUserApiConnections,
} from '@area-butler-types/types';
import ApiRequestContingentDto from './api-request-contingent.dto';
import ApiShowTourDto from './api-show-tour.dto';
import ApiUserSubscriptionDto from './api-user-subscription.dto';
import MapBoxStyleDto from './map-box-style.dto';
import { mapSubscriptionToApiSubscription } from '../user/mapper/subscription.mapper';
import { retrieveTotalRequestContingent } from '../user/schema/user.schema';
import ApiUserParentSettingsDto from './api-user-parent-settings.dto';
import ApiUserExportFontDto from './api-user-export-font.dto';
import ApiUserPoiIconsDto from './api-user-poi-icons.dto';

@Exclude()
class ApiUserDto implements ApiUser {
  @Expose()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MapBoxStyleDto)
  additionalMapBoxStyles: MapBoxStyleDto[];

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
  requestContingents: ApiRequestContingentDto[];

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
  showTour: ApiShowTourDto;

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
  subscription?: ApiUserSubscriptionDto;

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
  parentSettings?: ApiUserParentSettingsDto;

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

  @Expose()
  @IsOptional()
  @IsObject()
  apiConnections?: TApiUserApiConnections;
}

export default ApiUserDto;
