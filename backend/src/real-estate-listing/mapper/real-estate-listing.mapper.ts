import { RealEstateListingDocument } from '../schema/real-estate-listing.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { randomizeCoordinates } from '../../../../shared/functions/shared.functions';

export const mapRealEstateListingToApiRealEstateListing = (
  realEstateListing: RealEstateListingDocument,
  userId?: string,
  showAddress = true,
): ApiRealEstateListing => {
  return {
    id: realEstateListing.id,
    name: realEstateListing.name,
    address: showAddress ? realEstateListing.address : '',
    externalUrl: realEstateListing.externalUrl,
    coordinates: showAddress
      ? {
          lat: realEstateListing.location.coordinates[0],
          lng: realEstateListing.location.coordinates[1],
        }
      : randomizeCoordinates({
          lat: realEstateListing.location.coordinates[0],
          lng: realEstateListing.location.coordinates[1],
        }),
    showInSnippet: realEstateListing.showInSnippet,
    costStructure: realEstateListing.costStructure,
    characteristics: realEstateListing.characteristics,
    status: realEstateListing.status,
    belongsToParent: realEstateListing.userId !== userId,
    integrationId: realEstateListing.integrationParams?.integrationId,
    openAiRequestQuantity:
      realEstateListing.integrationParams?.openAiRequestQuantity,
    iframeEndsAt: realEstateListing.integrationParams?.iframeEndsAt?.toJSON(),
    isOnePageExportActive:
      realEstateListing.integrationParams?.isOnePageExportActive,
    isStatsFullExportActive:
      realEstateListing.integrationParams?.isStatsFullExportActive,
    externalSource: realEstateListing.externalSource,
    externalId: realEstateListing.externalId,
  };
};
