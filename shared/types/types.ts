export interface ApiSearch {
    address?: ApiAddress; // One of this or the next
    coordinates?: ApiCoordinates;
    timeInMinutes?: number; // One of this or the next
    distanceInMeters?: number;
    preferredMeansOfTransportation: MeansOfTransportation;
    preferredAmenities: Record<string, boolean> | {};
}

export interface ApiSearchResponse {
    centerOfInterest: ApiOsmEntity;
    entities: ApiOsmEntity[];
}

export interface ApiOsmEntity {
    label: string;
    type: string;
    name: string;
    address?: ApiAddress;
    coordinates: ApiCoordinates;
}

export interface ApiAddress {
    street: string;
    postalCode: string;
    city: string;
}

export interface ApiCoordinates {
    lat: string;
    lng: string;
}

export enum MeansOfTransportation {
    WALK,
    CAR,
    BICYCLE
}