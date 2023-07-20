import { HttpException, Injectable } from '@nestjs/common';

import { OverpassDataService } from '../data-provision/overpass-data/overpass-data.service';
import { configService } from '../config/config.service';
import {
  ApiCoordinates,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import { OverpassService } from '../client/overpass/overpass.service';
import {
  convertMetersToMinutes,
  convertMinutesToMeters,
} from '../../../shared/functions/shared.functions';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import {
  ApiUnitsOfTransportEnum,
  IApiFetchPoiDataRes,
} from '@area-butler-types/external-api';
import { IApiOverpassFetchNodes } from '@area-butler-types/overpass';

const MAX_DISTANCE_IN_METERS = 2000;

@Injectable()
export class LocationExtService {
  constructor(
    private readonly overpassService: OverpassService,
    private readonly overpassDataService: OverpassDataService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async fetchPoiData({
    location,
    poiNumber,
    transportMode,
    distance,
    unit,
    preferredAmenities = Object.values(OsmName),
  }: {
    location: string | ApiCoordinates;
    poiNumber: number;
    transportMode: MeansOfTransportation;
    distance: number;
    unit: ApiUnitsOfTransportEnum;
    preferredAmenities?: OsmName[];
  }): Promise<IApiFetchPoiDataRes> {
    let coordinates = location as ApiCoordinates;

    if (typeof location === 'string') {
      const place = await this.googleGeocodeService.fetchPlace(location);
      coordinates = place.geometry.location;
    }

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

    const result = !!configService.useOverpassDb()
      ? await this.overpassDataService.findForCenterAndDistance({
          ...fetchNodeParams,
          limit: poiNumber,
        })
      : await this.overpassService.fetchNodes(fetchNodeParams);

    return { result, input: { coordinates } };
  }
}
