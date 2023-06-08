import { useContext } from "react";
import { Feature, Polygon, Properties } from "@turf/helpers";
import circle from "@turf/circle";

import { useHttp } from "./http";
import {
  ApiCoordinates,
  ApiDataProvisionEnum,
  ApiGeojsonType,
  ApiGeometry,
  TApiDataProvision,
} from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";

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

const DISTANCE = 1000;
const CIRCLE_OPTIONS: Properties = { units: "kilometers" };

const calculateRelevantArea = (coords: ApiCoordinates): Feature<Polygon> => {
  const radius = DISTANCE / 1000;
  const center = [coords.lng, coords.lat];

  return circle(center, radius, CIRCLE_OPTIONS);
};

const cleanProperties = (completeData: TApiDataProvision): TCensusData => {
  const CENSUS_PROPERTIES: {
    [key: string]: { label: string; unit: string };
  } = {
    Einwohner: { label: "Einwohner", unit: "" },
    Frauen_A: { label: "Frauenanteil", unit: "%" },
    Alter_D: { label: "Ø Alter", unit: "Jahre" },
    unter18_A: { label: "Anteil, Bev. unter 18", unit: "%" },
    ab65_A: { label: "Anteil, Bev. ab 65", unit: "%" },
    Auslaender_A: { label: "Anteil, Ausländer", unit: "%" },
    HHGroesse_D: {
      label: "Ø Pers. pro HH",
      unit: "Personen",
    },
    Leerstandsquote: { label: "Anteil, Leerstand", unit: "%" },
    Wohnfl_Bew_D: {
      label: "Ø m² pro Kopf",
      unit: "m²",
    },
    Wohnfl_Whg_D: {
      label: "Ø m² pro Whng.",
      unit: "m²",
    },
  };

  return Object.keys(completeData).reduce<TCensusData>(
    (resultingCompleteData, layerName) => {
      const layerData = completeData[layerName as ApiDataProvisionEnum].reduce<
        ICensusData[]
      >((resultingLayerData, layerParameter) => {
        const processedProperties = Object.keys(
          layerParameter.properties
        ).reduce<any[]>((resultingProperties, propertyKey) => {
          if (!CENSUS_PROPERTIES.hasOwnProperty(propertyKey)) {
            return resultingProperties;
          }

          const resultingProperty = {
            label: CENSUS_PROPERTIES[propertyKey].label,
            unit:
              (layerParameter.properties as any)[propertyKey] >= 0
                ? CENSUS_PROPERTIES[propertyKey].unit
                : "",
            value:
              (layerParameter.properties as any)[propertyKey] >= 0
                ? (layerParameter.properties as any)[propertyKey]
                : "unbekannt",
          };

          resultingProperties.push(resultingProperty);

          return resultingProperties;
        }, []);

        resultingLayerData.push({
          ...layerParameter,
          properties: processedProperties,
        });

        return resultingLayerData;
      }, []);

      resultingCompleteData[layerName as ApiDataProvisionEnum] = layerData;

      return resultingCompleteData;
    },
    {} as TCensusData
  );
};

export const useCensusData = () => {
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post } = useHttp();

  const isIntegrationUser = !!integrationUser;

  const fetchCensusData = async (
    coords: ApiCoordinates
  ): Promise<TCensusData | undefined> => {
    const relevantArea = calculateRelevantArea(coords);
    const geo: ApiGeometry = relevantArea.geometry;

    const { data } = await post<TApiDataProvision>(
      isIntegrationUser
        ? "/api/zensus-atlas-int/query"
        : "/api/zensus-atlas/query",
      geo
    );

    if (!data) {
      return;
    }

    return cleanProperties(data);
  };

  return { fetchCensusData };
};
