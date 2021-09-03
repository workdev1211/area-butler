import { ApiAddress, ApiCoordinates } from '@area-butler-types/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as NodeGeocoder from 'node-geocoder';

@Injectable()
export class GeocodingService {
  private readonly client;

  constructor(private configService: ConfigService) {
    this.client = NodeGeocoder({
      provider: 'openstreetmap',
    });
  }

  async geocode(address: ApiAddress): Promise<ApiCoordinates> {
    const response = await this.client.geocode({
      street: address.street,
      postalcode: address.postalCode,
      city: address.city,
    });

    if (!!response && response.length > 0) {
      return {
        lat: response[0].latitude,
        lng: response[0].longitude,
      };
    }
    return {
      lat: 0,
      lng: 0,
    };
  }

  async reverse({ lat, lng }: ApiCoordinates): Promise<ApiAddress> {
    const response = await this.client.reverse({
      lat,
      lon: lng,
    });
    if (!!response && response.length > 0) {
      const address = response[0];
      return {
        street: `${address.streetName}${
          !!address.streetNumber ? ' ' + address.streetNumber : ''
        }`,
        postalCode: address.zipcode,
        city: address.city,
      };
    }
  }
}
