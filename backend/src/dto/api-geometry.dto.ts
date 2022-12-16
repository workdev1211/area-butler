import { IsArray, IsNotEmpty, IsIn } from 'class-validator';

import { ApiGeojsonType, ApiGeometry } from '@area-butler-types/types';

class ApiGeometryDto implements ApiGeometry {
  @IsNotEmpty()
  @IsArray()
  coordinates: any[];

  @IsNotEmpty()
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
  type: ApiGeojsonType;
}

export default ApiGeometryDto;
