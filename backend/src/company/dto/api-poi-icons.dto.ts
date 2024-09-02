import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Exclude, Type } from 'class-transformer';

import { IApiPoiIcon, IApiPoiIcons } from '@area-butler-types/types';
import ApiPoiIconDto from './api-poi-icon.dto';

@Exclude()
class ApiPoiIconsDto implements IApiPoiIcons {
  @Expose()
  @Type(() => ApiPoiIconDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  mapPoiIcons?: IApiPoiIcon[];

  @Expose()
  @Type(() => ApiPoiIconDto)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  menuPoiIcons?: IApiPoiIcon[];
}

export default ApiPoiIconsDto;
