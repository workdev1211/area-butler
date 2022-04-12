import { ApiCoordinates } from '@area-butler-types/types';
import { IsNumber, IsNotEmpty } from 'class-validator';

class ApiCoordinatesDto implements ApiCoordinates {

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()  
  lng: number;
}

export default ApiCoordinatesDto;
