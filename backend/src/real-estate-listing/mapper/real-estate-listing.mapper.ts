import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { RealEstateListingDocument } from '../schema/real-estate-listing.schema';

export const mapRealEstateListingToApiRealEstateListing = (
  realEstateListing: RealEstateListingDocument,
): ApiRealEstateListing => {
  console.log();
  return {
    id: realEstateListing.id,
    name: realEstateListing.name,
    address: realEstateListing.address,
    coordinates: realEstateListing.location
      ? {
          lat: realEstateListing.location.coordinates[0],
          lng: realEstateListing.location.coordinates[1],
        }
      : null,
    costStructure: realEstateListing.costStructure,
    characteristics: realEstateListing.characteristics,
  };
};
