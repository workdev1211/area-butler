import { Injectable } from '@nestjs/common';
import { configService } from 'src/config/config.service';
import { meansOfTransportations } from '../../../../shared/constants/constants';
import { HttpService } from '@nestjs/axios';
import {
  MeansOfTransportation,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import ApiCoordinatesDto from '../../dto/api-coordinates.dto';
import ApiIsochroneDto from '../../dto/api-isochrone.dto';

@Injectable()
export class IsochroneService {
  private baseUrl = 'https://api.mapbox.com/isochrone/v1/mapbox';

  constructor(private http: HttpService) {}

  async fetchIsochrone(
    preferredMeansOfTransportation: MeansOfTransportation,
    coordinates: ApiCoordinatesDto,
    limit: number,
    unit: UnitsOfTransportation,
  ): Promise<ApiIsochroneDto> {
    const contour =
      unit === UnitsOfTransportation.KILOMETERS
        ? 'contours_meters'
        : 'contours_minutes';
    const routingProfile =
      meansOfTransportations.find(
        (mot) => mot.type === preferredMeansOfTransportation,
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
