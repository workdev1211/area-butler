import { useContext } from "react";
import { Feature, Polygon } from "@turf/helpers";
import circle from "@turf/circle";

import { useHttp } from "./http";
import {
  ApiCoordinates,
  ApiGeometry,
  TApiDataProvision,
} from "../../../shared/types/types";
import { UserContext } from "../context/UserContext";
import { cleanCensusProperties } from "../../../shared/functions/census.functions";
import { TCensusData } from "../../../shared/types/data-provision";

const calculateRelevantArea = (
  coords: ApiCoordinates,
  distanceInMeters = 1000
): Feature<Polygon> =>
  circle([coords.lng, coords.lat], distanceInMeters / 1000, {
    units: "kilometers",
  });

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

    return cleanCensusProperties(data);
  };

  return { fetchCensusData };
};
