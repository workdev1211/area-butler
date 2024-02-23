import { IsNotEmpty, IsString, IsIn, IsNumber } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { GeoJsonPoint } from '../shared/types/geo-json';

@Exclude()
class ApiGeoJsonPointDto implements GeoJsonPoint {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsIn(['Point'])
  type: 'Point';

  @Expose()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  coordinates: number[];
}

export default ApiGeoJsonPointDto;
