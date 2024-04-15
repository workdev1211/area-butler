import { HttpException, Injectable } from '@nestjs/common';

import { OverpassDataService } from '../data-provision/overpass-data/overpass-data.service';
import { configService } from '../config/config.service';
import {
  ApiCoordinates,
  ApiOsmLocation,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
  OsmName,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import { OverpassService } from '../client/overpass/overpass.service';
import {
  convertMetersToMinutes,
  convertMinutesToMeters,
} from '../../../shared/functions/shared.functions';
import {
  ApiUnitsOfTransportEnum,
  IApiFetchSnapshotDataReq,
  IApiFetchSnapshotDataRes,
  SnapshotDataTypesEnum,
} from '../shared/types/external-api';
import { IApiOverpassFetchNodes } from '@area-butler-types/overpass';
import { UserDocument } from '../user/schema/user.schema';
import { SnapshotExtService } from './snapshot-ext.service';
import { defaultPoiTypes } from '../../../shared/constants/location';
import { SearchResultSnapshotDocument } from './schema/search-result-snapshot.schema';
import { createDirectLink } from '../shared/functions/shared';
import { FetchSnapshotService } from './fetch-snapshot.service';

interface IFetchPoiDataArgs {
  coordinates: ApiCoordinates;
  transportMode: MeansOfTransportation;
  distance: number;
  poiNumber?: number;
  unit: ApiUnitsOfTransportEnum;
  preferredAmenities?: OsmName[];
}

const MAX_DISTANCE_IN_METERS = 2000;

@Injectable()
export class LocationExtService {
  constructor(
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly overpassService: OverpassService,
    private readonly overpassDataService: OverpassDataService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {}

  async fetchPoiData({
    coordinates,
    transportMode,
    distance,
    unit,
    poiNumber = 0,
    preferredAmenities = defaultPoiTypes,
  }: IFetchPoiDataArgs): Promise<ApiOsmLocation[]> {
    let resultDistInMeters = distance;
    let maxPossibleDistance;

    switch (unit) {
      case ApiUnitsOfTransportEnum.KILOMETERS: {
        resultDistInMeters = resultDistInMeters * 1000;
        maxPossibleDistance = MAX_DISTANCE_IN_METERS / 1000;
        break;
      }

      case ApiUnitsOfTransportEnum.METERS: {
        maxPossibleDistance = MAX_DISTANCE_IN_METERS;
        break;
      }

      case ApiUnitsOfTransportEnum.MINUTES: {
        resultDistInMeters = convertMinutesToMeters(
          resultDistInMeters,
          transportMode,
        );

        maxPossibleDistance = convertMetersToMinutes(
          MAX_DISTANCE_IN_METERS,
          transportMode,
        );
        break;
      }
    }

    if (resultDistInMeters > MAX_DISTANCE_IN_METERS) {
      throw new HttpException(
        `The distance shouldn't be higher than ${maxPossibleDistance} ${unit.toLowerCase()}!`,
        400,
      );
    }

    // TODO test the limit with direct Overpass calls
    const fetchNodeParams: IApiOverpassFetchNodes = {
      coordinates,
      preferredAmenities,
      distanceInMeters: resultDistInMeters,
    };

    return !!configService.useOverpassDb()
      ? await this.overpassDataService.findForCenterAndDistance({
          ...fetchNodeParams,
          limit: poiNumber,
        })
      : await this.overpassService.fetchNodes(fetchNodeParams);
  }

  async fetchSnapshotData(
    user: UserDocument,
    fetchSnapshotData: IApiFetchSnapshotDataReq,
  ): Promise<IApiFetchSnapshotDataRes> {
    const {
      responseType,
      snapshotId,
      templateSnapshotId,
      lat,
      lng,
      address,
      transportMode,
      distance,
      unit,
      poiTypes,
    } = fetchSnapshotData;

    let snapshotResponse:
      | SearchResultSnapshotDocument
      | ApiSearchResultSnapshotResponse;

    if (snapshotId) {
      snapshotResponse =
        await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
          user,
          snapshotId,
        );
    }

    if (!snapshotId) {
      let resultingDistance = distance;
      let resultingUnit = unit as unknown as UnitsOfTransportation;

      if (unit === ApiUnitsOfTransportEnum.METERS) {
        resultingUnit = UnitsOfTransportation.KILOMETERS;
        resultingDistance = resultingDistance / 1000;
      }

      snapshotResponse = await this.snapshotExtService.createSnapshot({
        user,
        location: address || { lat, lng },
        templateSnapshotId,
        transportParams: [
          {
            type: transportMode,
            amount: resultingDistance,
            unit: resultingUnit,
          },
        ],
        poiTypes,
      });
    }

    const responseData = {
      input: {
        coordinates: snapshotResponse.snapshot.location,
        address: snapshotResponse.snapshot.placesLocation?.label,
      },
      snapshotId: snapshotResponse.id,
    } as IApiFetchSnapshotDataRes;

    const directLink = createDirectLink(snapshotResponse.token);

    switch (responseType) {
      case SnapshotDataTypesEnum.DIRECT_LINK: {
        responseData.result = directLink;
        return responseData;
      }

      case SnapshotDataTypesEnum.IFRAME_CODE: {
        const iframeCode = String.raw`
<iframe
 style="border: none"
 width="100%"
 height="100%"
 src="${directLink}"
 title="AreaButler Map Snippet"
></iframe>`;

        responseData.result = iframeCode.replace(/\n/g, '');
        return responseData;
      }

      case SnapshotDataTypesEnum.QR_CODE: {
        responseData.result = `${configService.getBaseApiUrl()}/api/location/embedded/qr-code/${
          snapshotResponse.token
        }`;

        return responseData;
      }
    }
  }
}
