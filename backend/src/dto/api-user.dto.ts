import { ApiUser } from '@area-butler-types/types';
import ApiRequestContingentDto from './api-request-contingent.dto';
import ApiShowTourDto from './api-show-tour.dto';
import ApiUserSubscriptionDto from './api-user-subscription.dto';
import MapBoxStyleDto from './map-box-style.dto';

class ApiUserDto implements ApiUser {
  additionalMapBoxStyles: MapBoxStyleDto[];
  color?: string;
  consentGiven?: Date;
  email: string;
  fullname: string;
  logo?: string;
  mapIcon?: string;
  requestContingents: ApiRequestContingentDto[];
  requestsExecuted: number;
  showTour: ApiShowTourDto;
  subscriptionPlan?: ApiUserSubscriptionDto;
}

export default ApiUserDto;
