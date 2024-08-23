import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Exclude, Type } from 'class-transformer';

import { ApiRealEstateExtSourcesEnum } from '@area-butler-types/real-estate';
import ApiUserExtConnectSettingsDto from './api-user-ext-connect-settings.dto';
import {
  TApiUserExtConnections,
  TApiUserExtConnectSettings,
} from '@area-butler-types/types';

@Exclude()
class ApiUserExtConnectionsDto implements TApiUserExtConnections {
  @Expose()
  @Type(() => ApiUserExtConnectSettingsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [ApiRealEstateExtSourcesEnum.ON_OFFICE]?: TApiUserExtConnectSettings;

  @Expose()
  @Type(() => ApiUserExtConnectSettingsDto)
  @IsOptional()
  @IsObject()
  @ValidateNested()
  [ApiRealEstateExtSourcesEnum.PROPSTACK]?: TApiUserExtConnectSettings;
}

export default ApiUserExtConnectionsDto;
