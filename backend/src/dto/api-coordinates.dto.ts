import { ApiCoordinates } from '@area-butler-types/types';

class ApiCoordinatesDto implements ApiCoordinates {
  lat: number;
  lng: number;
}

export default ApiCoordinatesDto;
