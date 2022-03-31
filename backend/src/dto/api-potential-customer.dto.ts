import { ApiPotentialCustomer } from '@area-butler-types/potential-customer';
import { OsmName } from '@area-butler-types/types';
import ApiPreferredLocationDto from './api-preferred-location.dto';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';
import TransportationParamDto from './transportation-param.dto';

class ApiPotentialCustomerDto implements ApiPotentialCustomer {
  email: string;
  id: string;
  name: string;
  preferredAmenities: OsmName[];
  preferredLocations: ApiPreferredLocationDto[];
  realEstateCharacteristics: ApiRealEstateCharacteristicsDto;
  realEstateCostStructure: ApiRealEstateCostDto;
  routingProfiles: TransportationParamDto[];
}

export default ApiPotentialCustomerDto
