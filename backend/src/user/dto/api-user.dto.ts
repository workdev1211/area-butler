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
  IApiUserParentSettings,
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
import ApiUserParentSettingsDto from './api-user-parent-settings.dto';
import ApiUserExportFontDto from './api-user-export-font.dto';
import ApiUserPoiIconsDto from './api-user-poi-icons.dto';
import { Iso3166_1Alpha2CountriesEnum } from '@area-butler-types/location';
import {
  ApiRequestContingent,
  ApiUserSubscription,
} from '@area-butler-types/subscription-plan';
import ApiMapboxStyleDto from '../../dto/api-mapbox-style.dto';

@Exclude()
class ApiUserDto implements ApiUser {
  @Expose()
  @Type(() => ApiMapboxStyleDto)
  @Transform(
    ({
      obj: { parentUser, additionalMapBoxStyles },
    }: {
      obj: UserDocument;
    }): IApiMapboxStyle[] => {
      const parentMapboxStyles = parentUser?.additionalMapBoxStyles;

      return [
        ...(parentMapboxStyles
          ? parentMapboxStyles.map((parentStyle) => {
              parentStyle.label = `Elternteil: ${parentStyle.label}`;
              return parentStyle;
            })
          : []),
        ...(additionalMapBoxStyles || []),
      ];
    },
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  additionalMapBoxStyles: IApiMapboxStyle[];

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
    ({ obj }) => retrieveTotalRequestContingent(obj.parentUser || obj),
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
    ({ obj: { parentUser, requestsExecuted } }) =>
      parentUser?.requestsExecuted || requestsExecuted,
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

  @Expose({ name: 'subscription', toClassOnly: true })
  @Type(() => ApiUserSubscriptionDto)
  @Transform(
    ({ obj: { subscription } }) =>
      subscription ? mapSubscriptionToApiSubscription(subscription) : null,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  subscription?: ApiUserSubscription;

  @Expose({ name: 'parentId' })
  @Transform(({ value }) => !!value, { toClassOnly: true })
  @IsNotEmpty()
  @IsBoolean()
  isChild: boolean;

  // TODO change it to the new API request
  @Expose()
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
  @IsOptional()
  @IsObject()
  @ValidateNested()
  parentSettings?: IApiUserParentSettings;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiUserPoiIconsDto)
  poiIcons?: IApiUserPoiIcons;

  @Expose()
  @Type(() => ApiUserExportFontDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
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
