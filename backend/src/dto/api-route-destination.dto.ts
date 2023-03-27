import { ApiRouteDestination } from '@area-butler-types/routing';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import ApiCoordinatesDto from './api-coordinates.dto';

class ApiRouteDestinationDto implements ApiRouteDestination {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => ApiCoordinatesDto)
  coordinates: ApiCoordinatesDto;

  @IsNotEmpty()
  title: string;
}

export default ApiRouteDestinationDto;
