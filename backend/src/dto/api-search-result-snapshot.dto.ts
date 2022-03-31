import { ApiSearchResultSnapshot } from '@area-butler-types/types';
import ApiOsmEntityDto from './api-osm-entity.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateListingDto from './api-real-estate-listing.dto';
import EntityRouteDto from './entity-route.dto';
import ApiSearchResponseDto from './api-search-response.dto';
import EntityTransitRouteDto from './entity-transit-route.dto';
import TransportationParamDto from './transportation-param.dto';

class ApiSearchResultSnapshotDto implements ApiSearchResultSnapshot {
  localityParams: ApiOsmEntityDto[];
  location: ApiCoordinatesDto;
  placesLocation: any;
  preferredLocations: ApiPreferredLocationDto[];
  realEstateListings: ApiRealEstateListingDto[];
  routes: EntityRouteDto[];
  searchResponse: ApiSearchResponseDto;
  transitRoutes: any[];
  transportationParams: TransportationParamDto[];
}

export default ApiSearchResultSnapshotDto;
