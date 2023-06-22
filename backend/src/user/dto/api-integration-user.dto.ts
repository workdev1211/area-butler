import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

import {
  IApiIntegrationUser,
  TApiIntegrationUserConfig,
  TApiIntUserAvailProdContingents,
} from '@area-butler-types/integration-user';

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
  @IsOptional()
  @IsObject()
  availProdContingents?: TApiIntUserAvailProdContingents;
}

export default ApiIntegrationUserDto;
