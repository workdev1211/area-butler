import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { RealEstateListingDocument } from '../schema/real-estate-listing.schema';

export const mapRealEstateListingToApiRealEstateListing = (
  realEstateListing: RealEstateListingDocument,
): ApiRealEstateListing => ({
  id: realEstateListing.id,  
  name: realEstateListing.name,
  address: realEstateListing.address,
  coordinates: realEstateListing.coordinates,
  costStructure: realEstateListing.costStructure,
  characteristics: realEstateListing.characterstics
});
