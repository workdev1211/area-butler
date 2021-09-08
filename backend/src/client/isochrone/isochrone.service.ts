import {
  ApiCoordinates,
  ApiIsochrone,
  MeansOfTransportation,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import { HttpService, Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';
import { meansOfTransportations } from '../../../../shared/constants/constants';

@Injectable()
export class IsochroneService {
  private baseUrl = 'https://api.mapbox.com/isochrone/v1/mapbox';

  constructor(private http: HttpService) {}

  async fetchIsochrone(
    preferredMeansOfTransportation: MeansOfTransportation,
    coordinates: ApiCoordinates,
    limit: number,
    unit: UnitsOfTransportation,
  ): Promise<ApiIsochrone> {
    const contour =
      unit === UnitsOfTransportation.METERS
        ? 'contours_meters'
        : 'contours_minutes';
    const routingProfile =
      meansOfTransportations.find(
        mot => mot.type === preferredMeansOfTransportation,
      )?.mode || '';
    const params = {
      [contour]: `${limit}`,
      polygons: true,
      access_token: configService.getMapBoxAccessToken(),
    };

    try {
      const result = await this.http
        .get(
          `${this.baseUrl}/${routingProfile}/${coordinates.lng},${coordinates.lat}`,
          { params },
        )
        .toPromise();
      return result.data;
    } catch (err) {
      console.error('Error while fetching data from isochrone', err);
      throw err;
    }
  }
}
