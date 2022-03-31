import { ApiUpsertRealEstateListing } from '@area-butler-types/real-estate';
import ApiRealEstateCharacteristicsDto from './api-real-estate-characteristics.dto';
import ApiCoordinatesDto from './api-coordinates.dto';
import ApiRealEstateCostDto from './api-real-estate-cost.dto';

class ApiUpsertRealEstateListingDto implements ApiUpsertRealEstateListing {
  address: string;
  characteristics?: ApiRealEstateCharacteristicsDto;
  coordinates?: ApiCoordinatesDto;
  costStructure?: ApiRealEstateCostDto;
  externalUrl?: string;
  name: string;
  showInSnippet: boolean;
}

export default ApiUpsertRealEstateListingDto;
