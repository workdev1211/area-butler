import { IsIn, IsString, IsOptional } from 'class-validator';

import { ApiGeojsonType, IApiLocationIndexReq } from '@area-butler-types/types';
import ApiCoordinatesOrAddressDto from '../../location/dto/api-coordinates-or-address.dto';

class ApiLocIndexQueryReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiLocationIndexReq
{
  @IsOptional()
  @IsString()
  @IsIn([
    'Polygon',
    'MultiPolygon',
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'GeometryCollection',
    'Feature',
    'FeatureCollection',
  ])
  type?: ApiGeojsonType;
}

export default ApiLocIndexQueryReqDto;
