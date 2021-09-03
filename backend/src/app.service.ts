import { ApiAddress, OsmName } from '@area-butler-types/types';
import { Injectable } from '@nestjs/common';
import { GeocodingService } from './client/geocoding/geocoding.service';
import { OverpassService } from './client/overpass/overpass.service';

@Injectable()
export class AppService {
  constructor(
    private geocodingService: GeocodingService,
    private overpassService: OverpassService,
  ) {}
  async getHello(): Promise<any> {
    return this.overpassService.fetchEntites(
      {
        lat: 53.5639671,
        lng: 9.9194837,
      },
      5000,
      [OsmName.bar],
    );
  }
}
