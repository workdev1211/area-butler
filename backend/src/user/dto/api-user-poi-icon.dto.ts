import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

import {
  IApiUserPoiIcon,
  OsmName,
  PoiGroupEnum,
  TPoiGroupName,
} from '@area-butler-types/types';

@Exclude()
class ApiUserPoiIconDto implements IApiUserPoiIcon {
  @Expose()
  @IsNotEmpty()
  @IsIn([...Object.values(OsmName), ...Object.values(PoiGroupEnum)])
  name: TPoiGroupName;

  @Expose()
  @IsNotEmpty()
  @IsString()
  file: string;
}

export default ApiUserPoiIconDto;
