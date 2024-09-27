import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Expose, Exclude, Transform, Type } from 'class-transformer';

import {
  IApiIntegrationUser,
  IIntUserSubscription,
  TApiIntUserAvailProdContingents,
} from '@area-butler-types/integration-user';
import { TIntegrationUserDocument } from '../schema/integration-user.schema';
import { IApiUserConfig } from '@area-butler-types/user';
import { IApiPoiIcons } from '@area-butler-types/types';
import ApiUserConfigDto from './api-user-config.dto';
import ApiPoiIconsDto from '../../company/dto/api-poi-icons.dto';
import ApiIntUserSubscriptionDto from './api-int-user-subscription.dto';

@Exclude()
class ApiIntegrationUserDto implements IApiIntegrationUser {
  @Expose()
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @Expose()
  @Type(() => ApiUserConfigDto)
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  config: IApiUserConfig;

  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationUserId: string;

  @Expose()
  @Transform(
    ({
      value,
      obj: { parentId },
    }: {
      obj: TIntegrationUserDocument;
      value: boolean;
    }) => value || !!parentId,
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsBoolean()
  isChild: boolean;

  // TODO create a dto
  @Expose()
  @IsOptional()
  @IsObject()
  availProdContingents?: TApiIntUserAvailProdContingents;

  @Expose()
  @Type(() => ApiPoiIconsDto)
  @Transform(
    ({
      value,
      obj: { company },
    }: {
      obj: TIntegrationUserDocument;
      value: IApiPoiIcons;
    }): IApiPoiIcons => value || company.config?.poiIcons,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsObject()
  @ValidateNested()
  poiIcons?: IApiPoiIcons;

  @Expose()
  @Type(() => ApiIntUserSubscriptionDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  subscription?: IIntUserSubscription;
}

export default ApiIntegrationUserDto;
