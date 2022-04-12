import { ApiUserRequests } from '@area-butler-types/types';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import ApiSearchDto from './api-search.dto';
class ApiUserRequestsDto implements ApiUserRequests {

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({each: true})
  @Type(() => ApiSearchDto)
  requests: ApiSearchDto[];
}

export default ApiUserRequestsDto;
