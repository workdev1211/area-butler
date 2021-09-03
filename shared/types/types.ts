export interface ApiSearch {
  address?: ApiAddress; // One of this or the next
  coordinates?: ApiCoordinates;
  timeInMinutes?: number; // One of this or the next
  distanceInMeters?: number;
  preferredMeansOfTransportation: MeansOfTransportation;
  preferredAmenities: Record<OsmName, boolean> | {};
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
  id?: string;
  type: OsmType;
  name: OsmName;
  label: string;
}

export interface ApiAddress {
  street?: string;
  postalCode?: string;
  city?: string;
}

export interface ApiCoordinates {
  lat: number;
  lng: number;
}

export enum MeansOfTransportation {
  WALK,
  CAR,
  BICYCLE,
}

export enum OsmType {
  leisure = "leisure",
  amenity = "amenity",
  shop = "shop",
  public_transport = "public_transport",
  highway = "highway",
}

export enum OsmName {
  playground = "playground",
  school = "school",
  bar = "bar",
  restaurant = "restaurant",
  park = "park",
  chemist = "chemist",
  supermarket = "supermarket",
  doctors = "doctors",
  dentist = "dentist",
  clinic = "clinic",
  kiosk = "kiosk",
  post_office = "post office",
  fuel = "fuel",
  station = "station",
  motorway_link = "motorway_link",
}
