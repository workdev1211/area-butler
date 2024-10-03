import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

import { ApiLastLocSearches } from '@area-butler-types/types';
import ApiLocationSearchDto from './api-location-search.dto';

@Exclude()
class ApiLastLocSearchesDto implements ApiLastLocSearches {
  @Expose()
  @Type(() => ApiLocationSearchDto)
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  locationSearches: ApiLocationSearchDto[];
}

export default ApiLastLocSearchesDto;
