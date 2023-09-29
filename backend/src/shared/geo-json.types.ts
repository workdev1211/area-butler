export interface GeoJsonPoint {
  type: 'Point';
  // it's a malformed tuple containing latitude and longitude
  // keep in mind that in this case latitude comes first
  coordinates: number[];
}
