import { ApiDataProvisionEnum, TApiDataProvision } from "../types/types";
import {
  ICensusData,
  TCensusData,
  TProcessedCensusData,
} from "../types/data-provision";
import { averageCensusData } from "../constants/data-provision";

export const cleanCensusProperties = (
  completeData: TApiDataProvision
): TCensusData => {
  const CENSUS_PROPERTIES: {
    [key: string]: { label: string; unit: string };
  } = {
    Einwohner: { label: "Einwohner", unit: "" },
    Frauen_A: { label: "Frauenanteil", unit: "%" },
    Alter_D: { label: "Ø Alter", unit: "Jahre" },
    unter18_A: { label: "Anteil, Bev. unter 18", unit: "%" },
    ab65_A: { label: "Anteil, Bev. ab 65", unit: "%" },
    // Auslaender_A: { label: "Anteil, Ausländer", unit: "%" },
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
      const layerData = completeData[layerName as ApiDataProvisionEnum]!.reduce<
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

const processCensusValue = (value: unknown): string =>
  !Number.isNaN(Number(value))
    ? (Math.round(Number(value) * 10) / 10).toFixed(1)
    : "-";

export const processCensusData = (
  censusData: TCensusData
): TProcessedCensusData =>
  Object.values<ApiDataProvisionEnum>(ApiDataProvisionEnum).reduce(
    (result, provisionKey): TProcessedCensusData => {
      if (!censusData[provisionKey]) {
        return result;
      }

      const censusCenter =
        censusData[provisionKey].find((c) =>
          (c.properties as any).some((p: any) => p.value !== "unbekannt")
        ) || (censusData.addressData[0] as any);

      censusCenter.properties.forEach(
        ({
          label,
          value,
          unit,
        }: {
          label: string;
          value: string;
          unit: string;
        }) => {
          const processedValue = processCensusValue(value);

          if (result[label]) {
            result[label].value[provisionKey] = processedValue;
          } else {
            result[label] = {
              label,
              value: {
                [provisionKey]: processedValue,
                averageData: processCensusValue(averageCensusData[label]),
              } as Record<ApiDataProvisionEnum, string>,
              unit,
            };
          }
        }
      );

      return result;
    },
    {} as TProcessedCensusData
  );
