import { HttpException, Injectable } from '@nestjs/common';

import { OverpassDataService } from '../data-provision/overpass-data/overpass-data.service';
import { configService } from '../config/config.service';
import {
  ApiCoordinates,
  MeansOfTransportation,
  OsmName,
} from '@area-butler-types/types';
import { OverpassService } from '../client/overpass/overpass.service';
import { convertMinutesToMeters } from '../../../shared/functions/shared.functions';
import { GoogleGeocodeService } from '../client/google/google-geocode.service';
import {
  ApiUnitsOfTransportEnum,
  IApiFetchPoiDataRes,
} from '@area-butler-types/external-api';

@Injectable()
export class LocationExtService {
  constructor(
    private readonly overpassService: OverpassService,
    private readonly overpassDataService: OverpassDataService,
    private readonly googleGeocodeService: GoogleGeocodeService,
  ) {}

  async fetchPoiData({
    location,
    transportMode,
    distance,
    unit,
    preferredAmenities = Object.values(OsmName),
  }: {
    location: string | ApiCoordinates;
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

    let resultingDistance = distance;

    switch (unit) {
      case ApiUnitsOfTransportEnum.KILOMETERS: {
        resultingDistance = resultingDistance * 1000;
        break;
      }

      case ApiUnitsOfTransportEnum.METERS: {
        break;
      }

      case ApiUnitsOfTransportEnum.MINUTES: {
        resultingDistance = convertMinutesToMeters(
          resultingDistance,
          transportMode,
        );
        break;
      }
    }

    if (resultingDistance > 5000) {
      throw new HttpException('The distance is too high!', 400);
    }

    const result = !!configService.useOverpassDb()
      ? await this.overpassDataService.findForCenterAndDistance(
          coordinates,
          resultingDistance,
          preferredAmenities,
        )
      : await this.overpassService.fetchEntities(
          coordinates,
          resultingDistance,
          preferredAmenities,
        );

    return { result, input: { coordinates } };
  }
}
