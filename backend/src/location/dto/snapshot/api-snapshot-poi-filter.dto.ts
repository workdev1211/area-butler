import { IsBoolean, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { IApiSnapshotConfigRealEstSettings } from '@area-butler-types/types';

@Exclude()
class ApiSnapshotConfigRealEstSettingsDto
  implements IApiSnapshotConfigRealEstSettings
{
  @Expose()
  @IsOptional()
  @IsBoolean()
  isCharacteristicsHidden?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isCostStructureHidden?: boolean;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isTypeShown?: boolean;
}

export default ApiSnapshotConfigRealEstSettingsDto;
