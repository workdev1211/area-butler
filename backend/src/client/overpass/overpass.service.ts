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
import {
  ApiAddress,
  ApiCoordinates,
  ApiOsmEntity,
  ApiOsmLocation,
  OsmName,
  OsmType,
} from '@area-butler-types/types';
import {
  IApiOverpassFetchNodes,
  TOverpassAvailCountries,
} from '@area-butler-types/overpass';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fuse = require('fuse.js/dist/fuse.common');

@Injectable()
export class OverpassService {
  private readonly baseUrl = configService.getOverpassBaseUrl();
  private readonly countries = configService.getOverpassCountries();
  private readonly logger = new Logger(OverpassService.name);

  constructor(private readonly http: HttpService) {}

  async fetchNodes(
    fetchNodeParams: IApiOverpassFetchNodes,
  ): Promise<ApiOsmLocation[]> {
    const { coordinates, preferredAmenities } = fetchNodeParams;
    const requestParams = await this.deriveRequestParams(fetchNodeParams);

    try {
      const response = await firstValueFrom(
        this.http.post(
          this.baseUrl.replace('xx', 'de'),
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
    centerCoordinates: ApiCoordinates,
    preferredAmenities: OsmName[],
  ): Promise<ApiOsmLocation[]> {
    const elements = Array.isArray(response)
      ? response
      : response?.data?.elements;

    if (!elements) {
      return [];
    }

    const rawElements: ApiOsmLocation[] = elements.reduce((result, element) => {
      const elementTags: Record<string, any> = element.tags;

      const isSwimmingPool =
        elementTags[OsmType.leisure] === OsmName.sports_centre &&
        elementTags['sport'] === 'swimming';

      const entityTypes = osmEntityTypes.filter((entityType) => {
        // It's a temporary workaround (a hack) to prevent the addition the third Osm parameter
        if (isSwimmingPool) {
          return entityType.name === OsmName.swimming_pool;
        }

        return elementTags[entityType.type] === entityType.name;
      });

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
            ? ` ${elementTags['addr:housenumber']}`
            : ''
        }`,
        postalCode: elementTags['addr:postcode'],
        city: elementTags['addr:city'],
      };

      const processedElements = entityTypes.reduce<ApiOsmLocation[]>(
        (result, entity) => {
          // sometimes Overpass returns POI objects which were not specified in the request query
          if (!preferredAmenities.includes(entity.name)) {
            return result;
          }

          // Adds the highway number to its title
          const processedTitle =
            entity.name === OsmName.motorway_link &&
            elementTags['destination:ref']
              ? `${entity.label} ${elementTags['destination:ref']}`
              : elementTags.name;

          result.push({
            entity: {
              id: `${element.id}-${entity.name}`,
              label: entity.label,
              title: processedTitle,
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
    }, []);

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

  private async deriveRequestParams({
    coordinates,
    distanceInMeters,
    preferredAmenities,
    limit,
  }: IApiOverpassFetchNodes): Promise<string> {
    const queryParts: string[] = [];
    queryParts.push('[out:json];(');

    for (const preferredAmenity of preferredAmenities) {
      const entityType = osmEntityTypes.find(
        (e) => e.name === preferredAmenity,
      );

      if (
        [OsmName.favorite, OsmName.property, OsmName.swimming_pool].includes(
          preferredAmenity,
        )
      ) {
        continue;
      }

      const entityQuery =
        entityType.replacementQuery ||
        `["${entityType.type}"="${entityType.name}"]${
          entityType.additionalQuery || ''
        }`;

      const completeQuery = `${entityQuery}(around:${distanceInMeters}, ${coordinates.lat},${coordinates.lng});`;

      queryParts.push(
        `node${completeQuery}`,
        `way${completeQuery}`,
        `relation${completeQuery}`,
      );
    }

    // TODO test the limit with direct Overpass calls
    queryParts.push(limit ? `);out center ${limit};` : ');out center;');

    return queryParts.join('');
  }

  async fetchByEntityType(
    entityType: ApiOsmEntity,
    countryCode: TOverpassAvailCountries = 'de',
  ): Promise<OverpassData[]> {
    const query = `[out:json][timeout:3600][maxsize:1073741824];(node["${entityType.type}"="${entityType.name}"];way["${entityType.type}"="${entityType.name}"];relation["${entityType.type}"="${entityType.name}"];);out center;`;

    try {
      this.logger.log(`Fetching ${entityType.name}`);

      const response = await firstValueFrom(
        this.http.get(this.baseUrl.replace('xx', countryCode), {
          params: { data: query },
        }),
      );

      return response?.data?.elements.reduce((result, el) => {
        const coordinates = el.center
          ? [el.center.lon, el.center.lat]
          : [el.lon, el.lat];

        const isValidCoordinates =
          typeof coordinates[0] === 'number' &&
          coordinates[0] >= -180 &&
          coordinates[0] <= 180 &&
          typeof coordinates[1] === 'number' &&
          coordinates[1] >= -90 &&
          coordinates[1] <= 90;

        if (isValidCoordinates) {
          result.push({
            ...el,
            geometry: {
              type: 'Point',
              coordinates,
            },
            overpassId: el.id,
            entityType: entityType.name,
          });
        }

        return result;
      }, []);
    } catch (e) {
      console.error('Error while fetching data from overpass', e);
      throw e;
    }
  }

  // left just in case of future usage
  async fetchAllByEntityType(
    entityType: ApiOsmEntity,
  ): Promise<OverpassData[]> {
    const query = `[out:json][timeout:3600][maxsize:1073741824];(node["${entityType.type}"="${entityType.name}"];way["${entityType.type}"="${entityType.name}"];relation["${entityType.type}"="${entityType.name}"];);out center;`;

    try {
      this.logger.log(`Fetching ${entityType.name}`);

      return (
        await Promise.all(
          this.countries.map(async (countryCode): Promise<OverpassData[]> => {
            const response = await firstValueFrom(
              this.http.get(this.baseUrl.replace('xx', countryCode), {
                params: { data: query },
              }),
            );

            return response?.data?.elements.reduce((result, el) => {
              const coordinates = el.center
                ? [el.center.lon, el.center.lat]
                : [el.lon, el.lat];

              const isValidCoordinates =
                typeof coordinates[0] === 'number' &&
                coordinates[0] >= -180 &&
                coordinates[0] <= 180 &&
                typeof coordinates[1] === 'number' &&
                coordinates[1] >= -90 &&
                coordinates[1] <= 90;

              if (isValidCoordinates) {
                result.push({
                  ...el,
                  geometry: {
                    type: 'Point',
                    coordinates,
                  },
                  overpassId: el.id,
                  entityType: entityType.name,
                });
              }

              return result;
            }, []);
          }),
        )
      ).flat();
    } catch (e) {
      console.error('Error while fetching data from overpass', e);
      throw e;
    }
  }
}
