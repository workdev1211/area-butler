import { ApiGeojsonFeature } from "./types";

export enum LocIndexPropsEnum {
  EVENING_ENTERTAINMENT = "evening_entertainment",
  HEALTH = "health",
  NEAR_SUPPLY = "near_supply",
  PUBLIC_TRANSPORT = "public_transport",
  KIDS = "kids",
  CULTURE = "culture",
  SPORTS = "sports",
  INDIVIDUAL_MOBILITY = "individual_mobility",
  TOURISM = "tourism",
}

export type TApiLocIndexProps = Record<LocIndexPropsEnum, number>;

export interface IApiLocIndexFeature extends ApiGeojsonFeature {
  properties: TApiLocIndexProps;
}

export interface ILocationIndex {
  name: string;
  value: number;
  colorStyle?: { backgroundColor: "#007960"; opacity: number };
}

export type TLocationIndexData = Record<LocIndexPropsEnum, ILocationIndex>;
