import { ApiShowTour } from '@area-butler-types/types';

class ApiShowTourDto implements ApiShowTour {
  customers: boolean;
  editor: boolean;
  profile: boolean;
  realEstates: boolean;
  result: boolean;
  search: boolean;
}

export default ApiShowTourDto;
