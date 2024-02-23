import { Feature, Polygon } from '@turf/helpers';
import circle from '@turf/circle';

import { ApiCoordinates } from '@area-butler-types/types';

export const calculateRelevantArea = (
  coordinates: ApiCoordinates,
  distanceInMeters = 1000,
): Feature<Polygon> =>
  // Due to the specifics of GeoJson, longitude comes first, then latitude
  circle([coordinates.lng, coordinates.lat], distanceInMeters / 1000, {
    units: 'kilometers',
  });
