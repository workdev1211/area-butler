import { ApiAddress } from '@area-butler-types/types';
import { Injectable } from '@nestjs/common';
import { GeocodingService } from './client/geocoding/geocoding.service';

@Injectable()
export class AppService {
  constructor(private geocodingService: GeocodingService) {}
  async getHello(): Promise<ApiAddress> {
    return await this.geocodingService.reverse({
      lat: 53.5639671,
      lng: 9.9194837,
    });
  }
}
