import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Expose, Exclude, Transform } from 'class-transformer';

import {
  IApiIntegrationUser,
  TApiIntegrationUserConfig,
  TApiIntUserAvailProdContingents,
} from '@area-butler-types/integration-user';
import { TIntegrationUserDocument } from '../schema/integration-user.schema';

@Exclude()
class ApiIntegrationUserDto implements IApiIntegrationUser {
  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationUserId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @Expose()
  @IsNotEmpty()
  @IsObject()
  config: TApiIntegrationUserConfig;

  @Expose()
  @Transform(
    ({
      value,
      obj: { parentId },
    }: {
      value: boolean;
      obj: TIntegrationUserDocument;
    }) => value || !!parentId,
    { toClassOnly: true },
  )
  @IsNotEmpty()
  @IsBoolean()
  isChild: boolean;

  @Expose()
  @IsOptional()
  @IsObject()
  availProdContingents?: TApiIntUserAvailProdContingents;
}

export default ApiIntegrationUserDto;
