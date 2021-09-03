import { ApiAddress, MeansOfTransportation, OsmName } from '@area-butler-types/types';
import { Injectable } from '@nestjs/common';
import { GeocodingService } from './client/geocoding/geocoding.service';
import { IsochroneService } from './client/isochrone/isochrone.service';
import { OverpassService } from './client/overpass/overpass.service';

@Injectable()
export class AppService {
  constructor(
    private geocodingService: GeocodingService,
    private overpassService: OverpassService,
    private isochroneService: IsochroneService
  ) {}
  async getHello(): Promise<any> {
    return await this.isochroneService.fetchIsochrone(MeansOfTransportation.CAR, {lat: 38.8951, lng: -77.0364}, 1000);
  }
}
