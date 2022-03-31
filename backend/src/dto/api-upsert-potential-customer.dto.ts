import { ApiUpsertPotentialCustomer } from '@area-butler-types/potential-customer';
import { OsmName, TransportationParam } from '@area-butler-types/types';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';

class ApiUpsertPotentialCustomerDto implements ApiUpsertPotentialCustomer {
  email: string;
  name: string;
  preferredAmenities?: OsmName[];
  preferredLocations?: ApiPreferredLocationDto[];
  realEstateCharacteristics: ApiRealEstateCharacteristicsDto;
  realEstateCostStructure: ApiRealEstateCostDto;
  routingProfiles?: TransportationParam[];
}

export default ApiUpsertPotentialCustomerDto;
