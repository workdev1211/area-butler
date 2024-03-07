import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Exclude, Type } from 'class-transformer';

import {
  TApiUserApiConnections,
  TApiUserApiConnectSettings,
} from '@area-butler-types/types';
import { ApiRealEstateExtSourcesEnum } from '@area-butler-types/real-estate';
import ApiUserApiConnectSettingsDto from './api-user-api-connect-settings.dto';

@Exclude()
class ApiUserApiConnectionsDto implements TApiUserApiConnections {
  @Expose()
  @Type(() => ApiUserApiConnectSettingsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [ApiRealEstateExtSourcesEnum.ON_OFFICE]?: TApiUserApiConnectSettings;

  @Expose()
  @Type(() => ApiUserApiConnectSettingsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [ApiRealEstateExtSourcesEnum.PROPSTACK]?: TApiUserApiConnectSettings;
}

export default ApiUserApiConnectionsDto;
