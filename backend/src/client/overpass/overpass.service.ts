import {ApiAddress, ApiCoordinates, ApiOsmLocation, OsmName,} from '@area-butler-types/types';
import {HttpService, Injectable, Logger} from '@nestjs/common';
import {osmEntityTypes} from '../../../../shared/constants/constants';
import * as harversine from 'haversine';
import {point, Properties} from '@turf/helpers';
import circle from "@turf/circle";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

const compareTwoStrings = (first: string | undefined, second: string | undefined) => {
    if (first === undefined && second === undefined) {
        return 1;
    }
    if (first === undefined || second === undefined) {
        return 0;
    }
    first = first.toLowerCase().replace(/\s+/g, '')
    second = second.toLowerCase().replace(/\s+/g, '')
    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;
    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1;

        firstBigrams.set(bigram, count);
    }
    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0;

        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }
    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}


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
                        const comparison = compareTwoStrings(elementToInspect.entity.name, element.entity.name);
                        if (comparison >= similiarityTreshold) {
                            const elementNameLonger = element.entity.name?.length > elementToInspect.entity.name?.length;
                            container.push(elementNameLonger ? elementToInspect : element);
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
