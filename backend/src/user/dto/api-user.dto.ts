import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type, Transform, Expose, Exclude } from 'class-transformer';

import { ApiUser } from '@area-butler-types/types';
import ApiRequestContingentDto from './api-request-contingent.dto';
import { mapSubscriptionToApiSubscription } from '../mapper/subscription.mapper';
import {
  retrieveTotalRequestContingent,
  UserDocument,
} from '../schema/user.schema';
import {
  ApiRequestContingent,
  ApiUserSubscription,
} from '@area-butler-types/subscription-plan';
import { SubscriptionDocument } from '../schema/subscription.schema';
import ApiUserConfigDto from './api-user-config.dto';
import { IApiUserConfig } from '@area-butler-types/user';

@Exclude()
class ApiUserDto implements ApiUser {
  @Expose()
  @Type(() => ApiUserConfigDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  config: IApiUserConfig;

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

  @Expose({ name: 'parentId', toClassOnly: true })
  @Transform(({ value }: { value: boolean }): boolean => !!value, {
    toClassOnly: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isChild: boolean;
}

export default ApiUserDto;
