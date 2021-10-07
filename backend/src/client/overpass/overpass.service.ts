import {ApiAddress, ApiCoordinates, ApiOsmLocation, OsmName,} from '@area-butler-types/types';
import {HttpService, Injectable, Logger} from '@nestjs/common';
import {osmEntityTypes} from '../../../../shared/constants/constants';
import * as harversine from 'haversine';
import {point, Properties} from '@turf/helpers';
import circle from "@turf/circle";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fuse = require('fuse.js/dist/fuse.common')

@Injectable()
export class OverpassService {
    private baseUrl = 'https://overpass.x.syndicats.co/api/interpreter';
    private logger: Logger = new Logger(OverpassService.name);

    constructor(private http: HttpService) {
    }

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
                .get(this.baseUrl, {params: {data: requestParams}})
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

        const rawElements = elements.map(element => {
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
                {unit: 'meter'},
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
                address
            };
        });


        const CIRCLE_OPTIONS: Properties = {units: 'meters'};
        const findDuplicatesAround = (elements, elementToInspect) => {
            const searchAroundDistance = osmEntityTypes.find(e => e.label === elementToInspect.entity.label)?.uniqueRadius || 20;
            const similiarityTreshold = osmEntityTypes.find(e => e.label === elementToInspect.entity.label)?.uniqueTreshold || 0.8;
            const polygon = circle(point([elementToInspect.coordinates.lat, elementToInspect.coordinates.lng]), searchAroundDistance, CIRCLE_OPTIONS);
            const container = [];
            elements
                .filter(e => e.entity.id !== elementToInspect.entity.id && e.entity.type === elementToInspect.entity.type)
                .forEach((element) => {
                    const {lat, lng} = element.coordinates;
                    const elementPoint = point([lat, lng]);

                    if (booleanPointInPolygon(elementPoint, polygon)) {
                        const f = new Fuse([elementToInspect.entity.name || ''], {
                            includeScore: true
                        });
                        const result = f.search(element.entity.name || '');
                        const comparison = (result.length && result[0].score) ? 1 - result[0].score : 1;
                        if (comparison >= similiarityTreshold) {
                            container.push(element);
                        }
                    }
                });
            return container;
        }

        const finalElements = [];
        const duplicates = []
        for (const rawElement of rawElements) {
            if (!duplicates.includes(rawElement.entity.id)) {
                const dups = findDuplicatesAround(rawElements, rawElement);
                duplicates.push(...dups.map(d => d.entity.id));
                finalElements.push(rawElement);
            }
        }
        return finalElements;
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
