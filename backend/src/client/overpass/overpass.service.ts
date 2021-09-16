import {ApiAddress, ApiCoordinates, ApiOsmLocation, OsmName,} from '@area-butler-types/types';
import {HttpService, Injectable} from '@nestjs/common';
import {osmEntityTypes} from '../../../../shared/constants/constants';
import * as harversine from 'haversine';

@Injectable()
export class OverpassService {
  private baseUrl = 'https://overpass.x.syndicats.co/api/interpreter';

  constructor(private http: HttpService) {}

  async fetchEntites(
    coordinates: ApiCoordinates,
    distanceInMeters: number,
    preferredAmenities: OsmName[],
  ): Promise<ApiOsmLocation[]> {
    const requestParams = await this.deriveRequestParams(
      coordinates,
      distanceInMeters,
      preferredAmenities,
    );

    try {
      const response = await this.http
        .get(this.baseUrl, { params: { data: requestParams } })
        .toPromise();

      return this.mapResponse(response, coordinates);
    } catch (e) {
      console.error('Error while fetching data from overpass', e);
      throw e;
    }
  }

  private async mapResponse(
    response,
    centerCoordinates: ApiCoordinates,
  ): Promise<ApiOsmLocation[]> {
    const elements = response?.data?.elements;

    if (!elements) {
      return [];
    }

    return elements.map(element => {
      const elementTags: Record<string, any> = element.tags;

      const entityType = osmEntityTypes.find(
        entityType => elementTags[entityType.type] === entityType.name,
      );

      const coordinates = !!element.center
        ? {
            lat: element.center.lat,
            lng: element.center.lon,
          }
        : {
            lat: element.lat,
            lng: element.lon,
          };

      const distanceInMeters = harversine(
        {
          latitude: centerCoordinates.lat,
          longitude: centerCoordinates.lng,
        },
        {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
        { unit: 'meter' },
      );

      const address: ApiAddress = {
        street: `${elementTags['addr:street']}${
          !!elementTags['addr:housenumber']
            ? ' ' + elementTags['addr:housenumber']
            : ''
        }`,
        postalCode: elementTags['addr:postcode'],
        city: elementTags['addr:city'],
      };

      return {
        entity: {
          id: element.id,
          label: entityType.label,
          type: entityType.name,
          name: elementTags.name,
        },
        coordinates,
        distanceInMeters,
        address,
      };
    });
  }

  private async deriveRequestParams(
    coordinates: ApiCoordinates,
    distanceInMeters: number,
    preferredAmenities: OsmName[],
  ) {
    const queryParts: string[] = [];
    queryParts.push('[out:json];( ');
    for (const preferredAmenity of preferredAmenities) {
      const entityType = osmEntityTypes.find(e => e.name === preferredAmenity);
      queryParts.push(
        `node["${entityType.type}"="${entityType.name}"](around:${distanceInMeters}, ${coordinates.lat},${coordinates.lng});`,
      );
      queryParts.push(
        `way["${entityType.type}"="${entityType.name}"](around:${distanceInMeters}, ${coordinates.lat},${coordinates.lng});`,
      );
      queryParts.push(
        `relation["${entityType.type}"="${entityType.name}"](around:${distanceInMeters}, ${coordinates.lat},${coordinates.lng});`,
      );
    }
    queryParts.push('); out center; ');

    return queryParts.join('');
  }
}
