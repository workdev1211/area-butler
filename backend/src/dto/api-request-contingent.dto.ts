import {
  ApiRequestContingent,
  ApiRequestContingentType,
} from '@area-butler-types/subscription-plan';

class ApiRequestContingentDto implements ApiRequestContingent {
  amount: number;
  date: Date;
  type: ApiRequestContingentType;
}

export default ApiRequestContingentDto;
