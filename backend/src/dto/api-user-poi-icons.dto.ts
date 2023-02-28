import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Exclude, Type } from 'class-transformer';

import { IApiUserPoiIcon, IApiUserPoiIcons } from '@area-butler-types/types';
import ApiUserPoiIconDto from './api-user-poi-icon.dto';

@Exclude()
class ApiUserPoiIconsDto implements IApiUserPoiIcons {
  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiUserPoiIconDto)
  mapPoiIcons?: IApiUserPoiIcon[];

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApiUserPoiIconDto)
  menuPoiIcons?: IApiUserPoiIcon[];
}

export default ApiUserPoiIconsDto;
