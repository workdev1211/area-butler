import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  IApiIntegrationParams,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';

@Exclude()
class ApiIntegrationParamsDto implements IApiIntegrationParams {
  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  integrationUserId: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(IntegrationTypesEnum)
  integrationType: IntegrationTypesEnum;
}

export default ApiIntegrationParamsDto;
