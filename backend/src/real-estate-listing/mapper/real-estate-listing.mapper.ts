import { RealEstateListingDocument } from '../schema/real-estate-listing.schema';
import { randomizeCoordinates } from '../../shared/shared.functions';
import ApiRealEstateListingDto from '../../dto/api-real-estate-listing.dto';

export const mapRealEstateListingToApiRealEstateListing = (
  realEstateListing: RealEstateListingDocument,
  userId: string,
  showAddress = true,
): ApiRealEstateListingDto => {
  return {
    id: realEstateListing.id,
    name: realEstateListing.name,
    address: showAddress ? realEstateListing.address : '',
    externalUrl: realEstateListing.externalUrl,
    coordinates: realEstateListing.location
      ? showAddress
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
    status: realEstateListing.status,
    belongsToParent: realEstateListing.userId !== userId,
  };
};
