import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
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
  ApiUser,
  IApiMapboxStyle,
  IApiUserExportFont,
  IApiUserPoiIcons,
} from '@area-butler-types/types';
import ApiRequestContingentDto from './api-request-contingent.dto';
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
import { getUnitedMapboxStyles } from '../../shared/functions/shared';
import { SubscriptionDocument } from '../schema/subscription.schema';
import ApiUserConfigDto from './api-user-config.dto';
import { IUserConfig } from '@area-butler-types/user';

@Exclude()
class ApiUserDto implements ApiUser {
  @Expose()
  @Type(() => ApiUserConfigDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  config: IUserConfig;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email: string;

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
  @IsOptional()
  @IsDate()
  consentGiven?: Date;

  // 'ApiUserSubscriptionDto' entity differs from a 'SubscriptionDocument' one
  @Expose()
  @Transform(
    ({ value }: { value: SubscriptionDocument }): ApiUserSubscription =>
      value ? mapSubscriptionToApiSubscription(value) : null,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  subscription?: ApiUserSubscription;

  // OLD

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
  color?: string;

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
  @Type(() => ApiMapboxStyleDto)
  @Transform(
    ({
      obj: { additionalMapBoxStyles, parentUser },
    }: {
      obj: UserDocument;
    }): IApiMapboxStyle[] =>
      getUnitedMapboxStyles(
        parentUser?.additionalMapBoxStyles,
        additionalMapBoxStyles,
      ),
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  extraMapboxStyles: IApiMapboxStyle[];

  @Expose({ name: 'parentId', toClassOnly: true })
  @Transform(({ value }: { value: boolean }): boolean => !!value, {
    toClassOnly: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isChild: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  logo?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mapIcon?: string;

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
}

export default ApiUserDto;
