import { useContext } from "react";

import {
  ApiFeatureElectionFeatureResultGroup,
  ApiFeatureElectionParty,
  ApiFederalElectionFeature,
} from "../../../shared/types/federal-election";
import {
  ApiCoordinates,
  ApiGeojsonType,
  ApiGeometry,
} from "../../../shared/types/types";
import { useHttp } from "./http";
import { ConfigContext } from "../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../shared/types/integration";

export interface FederalElectionDistrict {
  type: ApiGeojsonType;
  geometry: ApiGeometry;
  name: string;
  results: FederalElectionResult[];
}

export interface FederalElectionResult {
  party: ApiFeatureElectionParty;
  percentage: number;
  lastElectionPercentage: number;
}

export const useFederalElectionData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { post } = useHttp();

  const isIntegration = !!integrationType;

  const fetchFederalElectionData = async (
    point: ApiCoordinates
  ): Promise<FederalElectionDistrict | undefined> => {
    if (integrationType === IntegrationTypesEnum.MY_VIVENDA) {
      return;
    }

    const geo: ApiGeometry = {
      type: "Point",
      coordinates: [point.lng, point.lat],
    };

    const { data: federalElectionData } = await post<
      ApiFederalElectionFeature[]
    >(
      isIntegration
        ? "/api/federal-election-int/query"
        : "/api/federal-election/query",
      geo
    );

    if (!federalElectionData?.length) {
      return;
    }

    const electionResultData = federalElectionData[0];

    const partiesWithFivePercent =
      electionResultData.properties.ERGEBNIS.filter(
        (data) =>
          data.Gruppenart === ApiFeatureElectionFeatureResultGroup.PARTY &&
          data.Stimme === 2 &&
          !!data.Prozent &&
          !!data.VorpProzent &&
          data.Prozent > 5
      );

    // TODO refactor to 'reduce' and 'sort'
    const results: FederalElectionResult[] = partiesWithFivePercent
      .filter(
        (party) =>
          party.Anzahl ===
          Math.max.apply(
            Math,
            partiesWithFivePercent
              .filter((p) => p.Gruppenname === party.Gruppenname)
              .map((p) => p.Anzahl)
          )
      )
      .sort((r1, r2) => r2.Prozent - r1.Prozent)
      .map((data) => ({
        party: data.Gruppenname,
        percentage: Math.round(data.Prozent * 100) / 100,
        lastElectionPercentage: Math.round(data.VorpProzent * 100) / 100,
      }));

    return {
      name: electionResultData.properties.WKR_NAME,
      type: electionResultData.type,
      geometry: electionResultData.geometry,
      results,
    };
  };

  return { fetchFederalElectionData };
};
