import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform, Expose, Exclude } from 'class-transformer';

import { ApiUser } from '@area-butler-types/types';
import ApiRequestContingentDto from './api-request-contingent.dto';
import ApiShowTourDto from './api-show-tour.dto';
import ApiUserSubscriptionDto from './api-user-subscription.dto';
import MapBoxStyleDto from './map-box-style.dto';
import { mapSubscriptionToApiSubscription } from '../user/mapper/subscription.mapper';
import { retrieveTotalRequestContingent } from '../user/schema/user.schema';
import ApiUserParentSettingsDto from './api-user-parent-settings.dto';

@Exclude()
class ApiUserDto implements ApiUser {
  @Expose()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => MapBoxStyleDto)
  @Transform(({ value }) => value, { toClassOnly: true })
  additionalMapBoxStyles: MapBoxStyleDto[];

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
  color?: string;

  @Expose()
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value, { toClassOnly: true })
  consentGiven?: Date;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
  email: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
  fullname: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
  logo?: string;

  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value, { toClassOnly: true })
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
    ({ obj }) => obj.parentUser?.requestsExecuted || obj.requestsExecuted,
    { toClassOnly: true },
  )
  requestsExecuted: number;

  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ApiShowTourDto)
  @Transform(({ value }) => value, { toClassOnly: true })
  showTour: ApiShowTourDto;

  @Expose({ name: 'subscription', toClassOnly: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApiUserSubscriptionDto)
  @Transform(
    ({ obj }) =>
      obj.subscription
        ? mapSubscriptionToApiSubscription(obj.subscription)
        : null,
    { toClassOnly: true },
  )
  subscriptionPlan?: ApiUserSubscriptionDto;

  @Expose({ name: 'parentId' })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => !!value, { toClassOnly: true })
  isChild: boolean;

  // TODO change it to the new API request
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => ApiUserParentSettingsDto)
  @Transform(
    ({ obj: { parentUser } }) =>
      parentUser
        ? {
            color: parentUser.color,
            logo: parentUser.logo,
            mapIcon: parentUser.mapIcon,
          }
        : undefined,
    { toClassOnly: true },
  )
  parentSettings?: ApiUserParentSettingsDto;
}

export default ApiUserDto;
