import { RealEstateListingDocument } from '../schema/real-estate-listing.schema';
import { randomizeCoordinates } from '../../shared/shared.functions';
import ApiRealEstateListingDto from '../../dto/api-real-estate-listing.dto';

export const mapRealEstateListingToApiRealEstateListing = (
  realEstateListing: RealEstateListingDocument,
  showLocation = true,
): ApiRealEstateListingDto => {
  return {
    id: realEstateListing.id,
    name: realEstateListing.name,
    address: showLocation ? realEstateListing.address : '',
    externalUrl: realEstateListing.externalUrl,
    coordinates: realEstateListing.location
      ? showLocation
        ? {
            lat: realEstateListing.location.coordinates[0],
            lng: realEstateListing.location.coordinates[1],
          }
        : randomizeCoordinates({
            lat: realEstateListing.location.coordinates[0],
            lng: realEstateListing.location.coordinates[1],
          })
      : null,
    showInSnippet: realEstateListing.showInSnippet,
    costStructure: realEstateListing.costStructure,
    characteristics: realEstateListing.characteristics,
  };
};
