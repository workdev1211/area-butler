import { Injectable, Logger } from '@nestjs/common';
import * as harversine from 'haversine';
import { point, Properties } from '@turf/helpers';
import circle from '@turf/circle';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { osmEntityTypes } from '../../../../shared/constants/constants';
import { configService } from '../../config/config.service';
import { OverpassData } from '../../data-provision/schemas/overpass-data.schema';
import ApiCoordinatesDto from '../../dto/api-coordinates.dto';
import { ApiOsmEntity, OsmName } from '@area-butler-types/types';
import ApiOsmLocationDto from '../../dto/api-osm-location.dto';
import ApiAddressDto from '../../dto/api-address.dto';
import ApiOsmEntityDto from '../../dto/api-osm-entity.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fuse = require('fuse.js/dist/fuse.common');

@Injectable()
export class OverpassService {
  private readonly baseUrl = configService.getOverpassUrl();
  private readonly logger: Logger = new Logger(OverpassService.name);

  constructor(private readonly http: HttpService) {}

  async fetchEntities(
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
      const response = await firstValueFrom(
        this.http.post(
          this.baseUrl,
          new URLSearchParams({ data: requestParams }).toString(),
        ),
      );

      return this.mapResponse(response, coordinates, preferredAmenities);
    } catch (e) {
      console.error('Error while fetching data from overpass', e);
      throw e;
    }
  }

  async mapResponse(
    response,
    centerCoordinates: ApiCoordinatesDto,
    preferredAmenities: OsmName[],
  ): Promise<ApiOsmLocationDto[]> {
    const elements = Array.isArray(response)
      ? response
      : response?.data?.elements;

    if (!elements) {
      return [];
    }

    const rawElements: ApiOsmLocationDto[] = elements.reduce(
      (result, element) => {
        const elementTags: Record<string, any> = element.tags;

        const entityTypes = osmEntityTypes.filter(
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
              ? ` ${elementTags['addr:housenumber']}`
              : ''
          }`,
          postalCode: elementTags['addr:postcode'],
          city: elementTags['addr:city'],
        };

        const processedElements = entityTypes.reduce<ApiOsmLocationDto[]>(
          (result, entity) => {
            // sometimes Overpass returns POI objects which were not specified in the request query
            if (!preferredAmenities.includes(entity.name)) {
              return result;
            }

            result.push({
              entity: {
                id: `${element.id}-${entity.name}`,
                label: entity.label,
                // Adds the highway number to its title
                title:
                  entity.name === OsmName.motorway_link &&
                  elementTags['destination:ref']
                    ? `${entity.label} ${elementTags['destination:ref']}`
                    : elementTags.name,
                type: entity.type,
                name: entity.name,
              } as ApiOsmEntity,
              coordinates,
              distanceInMeters,
              address,
            });

            return result;
          },
          [],
        );

        result.push(...processedElements);

        return result;
      },
      [],
    );

    const CIRCLE_OPTIONS: Properties = { units: 'meters' };

    const findDuplicates = (elements, elementToInspect) => {
      const searchAroundDistance =
        osmEntityTypes.find((e) => e.label === elementToInspect.entity.label)
          ?.uniqueRadius || 20;

      const similarityThreshold =
        osmEntityTypes.find((e) => e.label === elementToInspect.entity.label)
          ?.uniqueThreshold || 0.8;

      const polygon = circle(
        point([
          elementToInspect.coordinates.lat,
          elementToInspect.coordinates.lng,
        ]),
        searchAroundDistance,
        CIRCLE_OPTIONS,
      );

      return elements.reduce((result, element) => {
        if (
          !(
            element.entity.id !== elementToInspect.entity.id &&
            element.entity.type === elementToInspect.entity.type &&
            element.entity.name === elementToInspect.entity.name
          )
        ) {
          return result;
        }

        const { lat, lng } = element.coordinates;
        const elementPoint = point([lat, lng]);
        const isElementInPolygon = booleanPointInPolygon(elementPoint, polygon);

        if (!isElementInPolygon) {
          return result;
        }

        const f = new Fuse([elementToInspect.entity.name || ''], {
          includeScore: true,
        });

        const found = f.search(element.entity.name || '');
        const comparison =
          found.length && found[0].score ? 1 - found[0].score : 1;

        if (
          comparison > similarityThreshold ||
          comparison === similarityThreshold
        ) {
          result.push(element);
        }

        return result;
      }, []);
    };

    const finalElements = [];
    const duplicates = [];

    rawElements.forEach((rawElement) => {
      if (!duplicates.includes(rawElement.entity.id)) {
        const foundDuplicates = findDuplicates(rawElements, rawElement);
        duplicates.push(...foundDuplicates.map((d) => d.entity.id));
        finalElements.push(rawElement);
      }
    });

    return finalElements;
  }

  private async deriveRequestParams(
    coordinates: ApiCoordinatesDto,
    distanceInMeters: number,
    preferredAmenities: OsmName[],
  ) {
    const queryParts: string[] = [];
    queryParts.push('[out:json];(');

    for (const preferredAmenity of preferredAmenities) {
      const entityType = osmEntityTypes.find(
        (e) => e.name === preferredAmenity,
      );

      queryParts.push(
        `node["${entityType.type}"="${entityType.name}"]${
          entityType.access ? `["access"${entityType.access}]` : ''
        }(around:${distanceInMeters}, ${coordinates.lat},${coordinates.lng});`,
      );

      queryParts.push(
        `way["${entityType.type}"="${entityType.name}"]${
          entityType.access ? `["access"${entityType.access}]` : ''
        }(around:${distanceInMeters}, ${coordinates.lat},${coordinates.lng});`,
      );

      queryParts.push(
        `relation["${entityType.type}"="${entityType.name}"]${
          entityType.access ? `["access"${entityType.access}]` : ''
        }(around:${distanceInMeters}, ${coordinates.lat},${coordinates.lng});`,
      );
    }

    queryParts.push(');out center;');

    return queryParts.join('');
  }

  async fetchForEntityType(
    entityType: ApiOsmEntityDto,
  ): Promise<OverpassData[]> {
    const query = `[out:json][timeout:3600][maxsize:1073741824];(node["${entityType.type}"="${entityType.name}"];way["${entityType.type}"="${entityType.name}"];relation["${entityType.type}"="${entityType.name}"];);out center;`;
    const hasCoordinates = (e) => e.center || (e.lat && e.lon);

    try {
      this.logger.debug(`fetching ${entityType.name}`);

      const response = await firstValueFrom(
        this.http.get(this.baseUrl, { params: { data: query } }),
      );

      this.logger.debug(`${entityType.name} fetched.`);

      return response?.data?.elements.filter(hasCoordinates).map((e) => ({
        ...e,
        geometry: {
          type: 'Point',
          coordinates: e.center ? [e.center.lon, e.center.lat] : [e.lon, e.lat],
        },
        overpassId: e.id,
        entityType: entityType.name,
      }));
    } catch (e) {
      console.error('Error while fetching data from overpass', e);
      throw e;
    }
  }
}
