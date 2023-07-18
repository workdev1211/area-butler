import { ApiGeojsonFeature } from "./types";

export enum ApiLocIndexFeatPropsEnum {
  EVENING_ENTERTAINMENT = "evening_entertainment",
  HEALTH = "health",
  NEAR_SUPPLY = "near_supply",
  PUBLIC_TRANSPORT = "public_transport",
  KIDS = "kids",
  CULTURE = "culture",
  SPORTS = "sports",
  INDIVIDUAL_MOBILITY = "individual_mobility",
}

export enum LocationIndicesEnum {
  evening_entertainment = "eveningEntertainment",
  health = "health",
  near_supply = "nearSupply",
  public_transport = "publicTransport",
  kids = "kids",
  culture = "culture",
  sports = "sports",
  individual_mobility = "individualMobility",
  tourism = "tourism",
}

export type TApiLocationIndexFeatureProperties = Record<
  ApiLocIndexFeatPropsEnum,
  number
>;

export interface IApiLocationIndexFeature extends ApiGeojsonFeature {
  properties: TApiLocationIndexFeatureProperties;
}
