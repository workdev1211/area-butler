import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import {
  IApiRealEstateIntegrationParams,
  IntegrationTypesEnum,
} from '@area-butler-types/integration';

@Exclude()
class ApiRealEstateIntegrationParamsDto
  implements IApiRealEstateIntegrationParams
{
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

export default ApiRealEstateIntegrationParamsDto;
