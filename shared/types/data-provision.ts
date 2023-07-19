import { ApiDataProvisionEnum, ApiGeojsonType, ApiGeometry } from "./types";

export interface ICensusData {
  geometry: ApiGeometry;
  type: ApiGeojsonType;
  properties: Array<{
    unit: string;
    label: string;
    value: any;
  }>;
}

export type TCensusData = Record<ApiDataProvisionEnum, ICensusData[]>;

export type TProcessedCensusData = Record<
  string,
  {
    label: string;
    value: Record<ApiDataProvisionEnum, string>;
    unit: string;
  }
>;
