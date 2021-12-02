import { useHttp } from "./http";
import {
  ApiCoordinates,
  ApiGeojsonFeature,
  ApiGeojsonType,
  ApiGeometry
} from "../../../shared/types/types";
import circle from "@turf/circle";
import { Feature, Polygon, Properties } from "@turf/helpers";

const DISTANCE = 1000;
const CIRCLE_OPTIONS: Properties = { units: "kilometers" };

const calculateRelevantArea = (coords: ApiCoordinates): Feature<Polygon> => {
  const radius = DISTANCE / 1000;
  const center = [coords.lng, coords.lat];
  return circle(center, radius, CIRCLE_OPTIONS);
};

const cleanProperties = (result: ApiGeojsonFeature[]) => {
  const CENSUS_PROPERTIES: {
    [key: string]: { label: string; unit: string };
  } = {
    Einwohner: { label: "Einwohner", unit: "" },
    Frauen_A: { label: "Frauenanteil", unit: "%" },
    Alter_D: { label: "Durchschnittsalter", unit: "Jahre" },
    unter18_A: { label: "Anteil der Bevölkerung unter 18 Jahre", unit: "%" },
    ab65_A: { label: "Anteil der Bevölkerung ab 65 Jahre", unit: "%" },
    Auslaender_A: { label: "Anteil der Ausländer", unit: "%" },
    HHGroesse_D: {
      label: "Durchschnittliche Haushaltsgröße",
      unit: "Personen"
    },
    Leerstandsquote: { label: "Anteil der leerstehenden Wohnungen", unit: "%" },
    Wohnfl_Bew_D: {
      label: "Durchschnittliche Wohnfläche je Bewohner",
      unit: "m²"
    },
    Wohnfl_Whg_D: {
      label: "Durchschnittliche Wohnfläche je Wohnung",
      unit: "m²"
    }
  };

  return result.map(r => {
    return {
      ...r,
      properties: Object.keys(r.properties)
        .filter(p => CENSUS_PROPERTIES.hasOwnProperty(p))
        .map(propertyKey => {
          return {
            label: CENSUS_PROPERTIES[propertyKey].label,
            unit:
              (r.properties as any)[propertyKey] >= 0
                ? CENSUS_PROPERTIES[propertyKey].unit
                : "",
            value:
              (r.properties as any)[propertyKey] >= 0
                ? (r.properties as any)[propertyKey]
                : "unbekannt"
          };
        })
    };
  });
};

export type CensusData = {
  geometry: ApiGeometry;
  type: ApiGeojsonType;
  properties: {
    unit: string;
    label: string;
    value: any;
  }[];
};

export const useCensusData = () => {
  const { post } = useHttp();

  const fetchNearData = async (
    coords: ApiCoordinates
  ): Promise<CensusData[]> => {
    const relevantArea = calculateRelevantArea(coords);
    const geo: ApiGeometry = relevantArea.geometry;
    const result = (await post("/api/zensus-atlas/query", geo))
      .data as ApiGeojsonFeature[];
    return cleanProperties(result);
  };
  return { fetchNearData };
};
