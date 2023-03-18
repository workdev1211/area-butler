import { Dispatch, SetStateAction, useContext } from "react";

import { SearchContext } from "../context/SearchContext";
import { useRouting } from "./routing";
import { RealEstateContext } from "../context/RealEstateContext";
import { useHttp } from "./http";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import {
  ApiSearch,
  ApiSearchResponse,
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  ApiUpdateSearchResultSnapshot,
  MeansOfTransportation,
} from "../../../shared/types/types";
import { IBusyModalItem } from "../components/BusyModal";
import { getUncombinedOsmEntityTypes } from "../../../shared/functions/shared.functions";
import { UserContext } from "../context/UserContext";

export const useAnalysis = () => {
  const { searchContextState } = useContext(SearchContext);
  const { realEstateState } = useContext(RealEstateContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post, put } = useHttp();
  const { fetchRoutes, fetchTransitRoutes } = useRouting();

  const createLocation = async (
    search: ApiSearch
  ): Promise<ApiSearchResponse> => {
    const { data: searchResponse } = await post<ApiSearchResponse>(
      integrationUser
        ? "/api/location-integration/search"
        : "/api/location/search",
      search
    );

    return searchResponse;
  };

  const createSnapshot = async (
    items: IBusyModalItem[],
    setBusyModalItems: Dispatch<SetStateAction<IBusyModalItem[]>>,
    searchResponse: ApiSearchResponse,
    userEmail?: string
  ): Promise<ApiSearchResultSnapshotResponse> => {
    const routes: EntityRoute[] = [];
    const transitRoutes: EntityTransitRoute[] = [];
    const location = searchContextState.location!;
    const preferredLocations: ApiPreferredLocation[] =
      searchContextState.preferredLocations || [];

    let index = 0;

    for (const preferredLocation of preferredLocations) {
      items.push({
        key: `fetch-routes-${preferredLocation.title}-${index}`,
      });
      setBusyModalItems([...items]);

      const routesResult = await fetchRoutes({
        userEmail,
        meansOfTransportation: [
          MeansOfTransportation.BICYCLE,
          MeansOfTransportation.CAR,
          MeansOfTransportation.WALK,
        ],
        origin: location,
        destinations: [
          {
            title: preferredLocation.title,
            coordinates: preferredLocation.coordinates!,
          },
        ],
      });

      routes.push({
        routes: routesResult[0].routes,
        title: routesResult[0].title,
        show: [],
        coordinates: preferredLocation.coordinates!,
      });

      items.push({
        key: `fetch-transit-routes-${preferredLocation.title}-${index}`,
      });
      setBusyModalItems([...items]);

      const transitRoutesResult = await fetchTransitRoutes({
        userEmail,
        origin: location,
        destinations: [
          {
            title: preferredLocation.title,
            coordinates: preferredLocation.coordinates!,
          },
        ],
      });

      if (transitRoutesResult.length && transitRoutesResult[0].route) {
        transitRoutes.push({
          route: transitRoutesResult[0].route,
          title: transitRoutesResult[0].title,
          show: false,
          coordinates: preferredLocation.coordinates!,
        });
      }

      index += 1;
    }

    items.push({
      key: "save-map-snippet",
    });
    setBusyModalItems([...items]);

    return (
      await post<ApiSearchResultSnapshotResponse, ApiSearchResultSnapshot>(
        integrationUser
          ? "/api/location-integration/snapshot"
          : "/api/location/snapshot",
        {
          location,
          preferredLocations,
          routes,
          transitRoutes,
          placesLocation: searchContextState.placesLocation,
          transportationParams: searchContextState.transportationParams,
          localityParams: getUncombinedOsmEntityTypes(
            searchContextState.localityParams
          ),
          searchResponse: searchResponse,
          realEstateListings: realEstateState.listings,
          integrationId: searchContextState.integrationId,
        }
      )
    ).data;
  };

  const updateSnapshot = async (
    snapshotResponse: ApiSearchResultSnapshotResponse,
    snapshotConfig: ApiSearchResultSnapshotConfig
  ): Promise<ApiUpdateSearchResultSnapshot> => {
    const { data: updatedSnapshotResponse } =
      await put<ApiUpdateSearchResultSnapshot>(
        integrationUser
          ? `/api/location-integration/snapshot/${snapshotResponse?.id}`
          : `/api/location/snapshot/${snapshotResponse?.id}`,
        {
          config: snapshotConfig,
          snapshot: {
            ...snapshotResponse?.snapshot,
          },
        }
      );

    return updatedSnapshotResponse;
  };

  return { createLocation, createSnapshot, updateSnapshot };
};
