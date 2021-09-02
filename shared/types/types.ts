export interface ApiSearch {
    address?: ApiAddress; // One of this or the next
    coordinates?: ApiCoordinates;
    timeInMinutes?: number; // One of this or the next
    distanceInMeters?: number;
    preferredMeansOfTransportation: MeansOfTransportation;
    preferredAmenities: Record<string, boolean> | {};
}

export interface ApiSearchResponse {
    centerOfInterest: ApiOsmLocation;
    locationsOfInterest: ApiOsmLocation[];
}

export interface ApiOsmLocation {
    entity: ApiOsmEntity;
    coordinates: ApiCoordinates;
    distanceInMeters: number;
    address: ApiAddress;
}

export interface ApiOsmEntity {
    type: string;
    label: string;
    name: string;
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