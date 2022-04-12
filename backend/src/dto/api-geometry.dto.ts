import { ApiGeojsonType, ApiGeometry } from '@area-butler-types/types';
import { IsArray, IsNotEmpty, IsIn } from 'class-validator';
class ApiGeometryDto implements ApiGeometry {


  @IsArray()
  @IsNotEmpty()
  coordinates: any[];

  @IsNotEmpty()
  @IsIn(["Polygon", "MultiPolygon", "Point", "MultiPoint", "LineString", "MultiLineString", "GeometryCollection", "Feature", "FeatureCollection"])
  type: ApiGeojsonType;
}

export default ApiGeometryDto;
