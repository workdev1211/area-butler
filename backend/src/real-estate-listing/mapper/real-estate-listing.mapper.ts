import { RealEstateListingDocument } from '../schema/real-estate-listing.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { randomizeCoordinates } from '../../../../shared/functions/shared.functions';
import { UserDocument } from '../../user/schema/user.schema';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { processLocationIndices } from '../../../../shared/functions/location-index.functions';

export const mapRealEstateListingToApiRealEstateListing = (
  user: UserDocument | TIntegrationUserDocument,
  realEstateListing: RealEstateListingDocument,
  showAddress = true,
): ApiRealEstateListing => {
  const isIntegrationUser = !!user && 'integrationUserId' in user;

  const isFromParent =
    !!user && isIntegrationUser
      ? realEstateListing.integrationParams.integrationUserId !==
        user.integrationUserId
      : realEstateListing.userId !== user.id;

  const locationIndices = realEstateListing.locationIndices
    ? processLocationIndices(realEstateListing.locationIndices)
    : undefined;

  return {
    isFromParent,
    locationIndices,
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
    status2: realEstateListing.status2,
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
