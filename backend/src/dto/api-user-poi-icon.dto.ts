import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

import { IApiUserPoiIcon, OsmName } from '@area-butler-types/types';

@Exclude()
class ApiUserPoiIconDto implements IApiUserPoiIcon {
  @Expose()
  @IsNotEmpty()
  @IsEnum(OsmName)
  name: OsmName;

  @Expose()
  @IsNotEmpty()
  @IsString()
  file: string;
}

export default ApiUserPoiIconDto;
