import { IsIn, IsString, IsOptional } from 'class-validator';

import { ApiGeojsonType } from '@area-butler-types/types';
import ApiCoordinatesOrAddressDto from '../../location/dto/api-coordinates-or-address.dto';
import { IApiQueryLocIndicesReq } from '../../shared/types/external-api';

class ApiQueryLocIndicesReqDto
  extends ApiCoordinatesOrAddressDto
  implements IApiQueryLocIndicesReq
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

export default ApiQueryLocIndicesReqDto;
