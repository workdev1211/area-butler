import { ApiUserRequests } from '@area-butler-types/types';
import ApiSearchDto from './api-search.dto';

class ApiUserRequestsDto implements ApiUserRequests {
  requests: ApiSearchDto[];
}

export default ApiUserRequestsDto
