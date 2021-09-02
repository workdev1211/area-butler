export interface ApiSearch {
    address?: ApiAddress; // One of this or the next
    coordinates?: ApiCoordinates;
    timeInMinutes?: number; // One of this or the next
    distanceInMeters?: number;
    preferredMeansOfTransportation: MeansOfTransportation;
    preferredAmenities: Record<string, boolean> | {};
}

export interface ApiSearchResponse {
    
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

export interface ApiOsmEntity {
    type: string;
    name: string;
    label: string;
}

export enum MeansOfTransportation {
    WALK,
    CAR,
    BICYCLE
}