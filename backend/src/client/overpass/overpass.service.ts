import { Injectable, Logger } from '@nestjs/common';
import { osmEntityTypes } from '../../../../shared/constants/constants';
import * as harversine from 'haversine';
import { point, Properties } from '@turf/helpers';
import circle from '@turf/circle';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { configService } from '../../config/config.service';
import { OverpassData } from '../../data-provision/schemas/overpass-data.schema';
import { HttpService } from '@nestjs/axios';
import ApiCoordinatesDto from '../../dto/api-coordinates.dto';
import { OsmName } from '@area-butler-types/types';
import ApiOsmLocationDto from '../../dto/api-osm-location.dto';
import ApiAddressDto from '../../dto/api-address.dto';
import ApiOsmEntityDto from '../../dto/api-osm-entity.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fuse = require('fuse.js/dist/fuse.common');

@Injectable()
export class OverpassService {
  private baseUrl = configService.getOverpassUrl();
  private logger: Logger = new Logger(OverpassService.name);

  constructor(private http: HttpService) {}

  async fetchEntites(
    coordinates: ApiCoordinatesDto,
    distanceInMeters: number,
    preferredAmenities: OsmName[],
  ): Promise<ApiOsmLocationDto[]> {
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

  async mapResponse(
    response,
    centerCoordinates: ApiCoordinatesDto,
  ): Promise<ApiOsmLocationDto[]> {
    const elements = Array.isArray(response)
      ? response
      : response?.data?.elements;

    if (!elements) {
      return [];
    }

    const rawElements = elements.map((element) => {
      const elementTags: Record<string, any> = element.tags;

      const entityType = osmEntityTypes.find(
        (entityType) => elementTags[entityType.type] === entityType.name,
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

      const address: ApiAddressDto = {
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

    const CIRCLE_OPTIONS: Properties = { units: 'meters' };
    const findDuplicatesAround = (elements, elementToInspect) => {
      const searchAroundDistance =
        osmEntityTypes.find((e) => e.label === elementToInspect.entity.label)
          ?.uniqueRadius || 20;
      const similiarityTreshold =
        osmEntityTypes.find((e) => e.label === elementToInspect.entity.label)
          ?.uniqueTreshold || 0.8;
      const polygon = circle(
        point([
          elementToInspect.coordinates.lat,
          elementToInspect.coordinates.lng,
        ]),
        searchAroundDistance,
        CIRCLE_OPTIONS,
      );
      const container = [];
      elements
        .filter(
          (e) =>
            e.entity.id !== elementToInspect.entity.id &&
            e.entity.type === elementToInspect.entity.type,
        )
        .forEach((element) => {
          const { lat, lng } = element.coordinates;
          const elementPoint = point([lat, lng]);

          if (booleanPointInPolygon(elementPoint, polygon)) {
            const f = new Fuse([elementToInspect.entity.name || ''], {
              includeScore: true,
            });
            const result = f.search(element.entity.name || '');
            const comparison =
              result.length && result[0].score ? 1 - result[0].score : 1;
            if (comparison >= similiarityTreshold) {
              container.push(element);
            }
          }
        });
      return container;
    };

    const finalElements = [];
    const duplicates = [];
    for (const rawElement of rawElements) {
      if (!duplicates.includes(rawElement.entity.id)) {
        const dups = findDuplicatesAround(rawElements, rawElement);
        duplicates.push(...dups.map((d) => d.entity.id));
        finalElements.push(rawElement);
      }
    }
    return finalElements;
  }

  private async deriveRequestParams(
    coordinates: ApiCoordinatesDto,
    distanceInMeters: number,
    preferredAmenities: OsmName[],
  ) {
    const queryParts: string[] = [];
    queryParts.push('[out:json];( ');
    for (const preferredAmenity of preferredAmenities) {
      const entityType = osmEntityTypes.find(
        (e) => e.name === preferredAmenity,
      );
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

  async fetchForEntityType(
    entitType: ApiOsmEntityDto,
  ): Promise<OverpassData[]> {
    const query = `[out:json][timeout:3600][maxsize:1073741824];(node["${entitType.type}"="${entitType.name}"];way["${entitType.type}"="${entitType.name}"];relation["${entitType.type}"="${entitType.name}"];);out center;`;
    const hasCoordinates = (e) => e.center || (e.lat && e.lon);
    try {
      this.logger.debug(`fetching ${entitType.name}`);
      const response = await this.http
        .get(this.baseUrl, { params: { data: query } })
        .toPromise();
      this.logger.debug(`${entitType.name} fetched.`);

      return response?.data?.elements.filter(hasCoordinates).map((e) => ({
        ...e,
        geometry: {
          type: 'Point',
          coordinates: !!e.center
            ? [e.center.lon, e.center.lat]
            : [e.lon, e.lat],
        },
        overpassId: e.id,
        entityType: entitType.name,
      }));
    } catch (e) {
      console.error('Error while fetching data from overpass', e);
      throw e;
    }
  }
}
