import {
  ApiCoordinates, MeansOfTransportation
} from '@area-butler-types/types';
import { HttpService, Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';
import { meansOfTransportations } from '../../../../shared/constants/constants';

@Injectable()
export class IsochroneService {
  private baseUrl = 'https://api.mapbox.com/isochrone/v1/mapbox';

  constructor(
    private http: HttpService
  ) {}

  async fetchIsochrone(
    preferredMeansOfTransportation: MeansOfTransportation,
    coordinates: ApiCoordinates,
    distanceInMeters?: number,
    timeInMinutes?: number,
  ) {
    const contour = !!distanceInMeters ? 'contours_meters' : 'contours_minutes';
    const limit = distanceInMeters || timeInMinutes;
    const routingProfile =
      meansOfTransportations.find(
        mot => mot.type === preferredMeansOfTransportation,
      )?.mode || '';

    const params = {
      [contour]: `${limit / 2},${limit}`,
      polygons: true,
      access_token: configService.getMapBoxAccessToken(),
    };

    const result = await this.http
      .get(
        `${this.baseUrl}/${routingProfile}/${coordinates.lng},${coordinates.lat}`,
        { params },
      )
      .toPromise();
    return result.data;
  }
}
