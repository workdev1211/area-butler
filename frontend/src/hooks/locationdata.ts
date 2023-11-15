import { Dispatch, RefObject, SetStateAction, useContext } from "react";
import { AxiosResponse } from "axios";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { useRouting } from "./routing";
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
import { ICurrentMapRef } from "../shared/search-result.types";
import { toastError, toastSuccess } from "../shared/shared.functions";
import { IApiLateSnapConfigOption } from "../../../shared/types/location";
import { ConfigContext } from "../context/ConfigContext";

export const useLocationData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);

  const { get, post, put, deleteRequest } = useHttp();
  const { fetchRoutes, fetchTransitRoutes } = useRouting();

  const isIntegration = !!integrationType;

  const createLocation = async (
    search: ApiSearch
  ): Promise<ApiSearchResponse> => {
    const { data: searchResponse } = await post<ApiSearchResponse>(
      isIntegration ? "/api/location-int/search" : "/api/location/search",
      search
    );

    return searchResponse;
  };

  const fetchSnapshot = async (
    snapshotId: string
  ): Promise<ApiSearchResultSnapshotResponse> => {
    return (
      await get<ApiSearchResultSnapshotResponse>(
        isIntegration
          ? `/api/location-int/snapshot/${snapshotId}`
          : `/api/location/snapshot/${snapshotId}`
      )
    ).data;
  };

  const fetchSnapshots = async (
    queryParams?: string
  ): Promise<ApiSearchResultSnapshotResponse[]> => {
    let url: string = isIntegration
      ? "/api/location-int/snapshots"
      : "/api/location/snapshots";

    if (queryParams) {
      url += `?${queryParams}`;
    }

    return (await get<ApiSearchResultSnapshotResponse[]>(url)).data;
  };

  const fetchLateSnapConfigs = async (
    limitNumber: number
  ): Promise<IApiLateSnapConfigOption[]> => {
    let url = isIntegration
      ? "/api/location-int/snapshots/configs"
      : "/api/location/snapshots/configs";

    url += `?limitNumber=${limitNumber}`;

    return (await get<IApiLateSnapConfigOption[]>(url)).data;
  };

  const createSnapshot = async ({
    busyModalItems,
    setBusyModalItems,
    searchResponse,
    userEmail,
  }: {
    busyModalItems: IBusyModalItem[];
    setBusyModalItems: Dispatch<SetStateAction<IBusyModalItem[]>>;
    searchResponse: ApiSearchResponse;
    userEmail?: string;
  }): Promise<ApiSearchResultSnapshotResponse> => {
    const routes: EntityRoute[] = [];
    const transitRoutes: EntityTransitRoute[] = [];
    const location = searchContextState.location!;
    const preferredLocations: ApiPreferredLocation[] =
      searchContextState.preferredLocations || [];

    let index = 0;

    // TODO think about moving this logic to the backend
    for (const preferredLocation of preferredLocations) {
      busyModalItems.push({
        key: `fetch-routes-${preferredLocation.title}-${index}`,
      });
      setBusyModalItems([...busyModalItems]);

      const routesResult = await fetchRoutes({
        userEmail,
        meansOfTransportation: Object.keys(
          searchResponse.routingProfiles
        ) as MeansOfTransportation[],
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

      busyModalItems.push({
        key: `fetch-transit-routes-${preferredLocation.title}-${index}`,
      });
      setBusyModalItems([...busyModalItems]);

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

    busyModalItems.push({
      key: "save-map-snapshot",
    });
    setBusyModalItems([...busyModalItems]);

    return (
      await post<ApiSearchResultSnapshotResponse, ApiSearchResultSnapshot>(
        isIntegration ? "/api/location-int/snapshot" : "/api/location/snapshot",
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
          realEstateListings: [],
          integrationId: searchContextState.realEstateListing?.integrationId,
        }
      )
    ).data;
  };

  const updateSnapshot = async (
    snapshotId: string,
    updateSnapshotData: ApiUpdateSearchResultSnapshot
  ): Promise<ApiSearchResultSnapshotResponse> => {
    return (
      await put<ApiSearchResultSnapshotResponse>(
        isIntegration
          ? `/api/location-int/snapshot/${snapshotId}`
          : `/api/location/snapshot/${snapshotId}`,
        updateSnapshotData
      )
    ).data;
  };

  const saveSnapshotConfig = async (
    mapRef: RefObject<ICurrentMapRef>,
    snapshotId: string
  ): Promise<ApiSearchResultSnapshotResponse | undefined> => {
    if (!mapRef.current || !searchContextState.responseConfig) {
      return;
    }

    const defaultActiveGroups =
      searchContextState.responseGroupedEntities?.reduce<string[]>(
        (result, { title, active }) => {
          if (active) {
            result.push(title);
          }

          return result;
        },
        []
      );

    const config: ApiSearchResultSnapshotConfig = {
      ...searchContextState.responseConfig,
      defaultActiveGroups,
      defaultActiveMeans: searchContextState.responseActiveMeans,
    };

    const mapZoomLevel = mapRef.current.getZoom();

    if (mapZoomLevel) {
      config.zoomLevel = mapZoomLevel;
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
      payload: config,
    });

    try {
      const snapshotResponse = await updateSnapshot(snapshotId, {
        config,
      });

      toastSuccess("Einstellungen gespeichert!");

      return snapshotResponse;
    } catch (e) {
      toastError("Fehler beim Speichern der Einstellungen!");
    }
  };

  const deleteSnapshot = async (
    snapshotId: string
  ): Promise<AxiosResponse<void>> => {
    return deleteRequest<void>(
      isIntegration
        ? `/api/location-int/snapshot/${snapshotId}`
        : `/api/location/snapshot/${snapshotId}`
    );
  };

  return {
    createLocation,
    fetchSnapshot,
    fetchSnapshots,
    fetchLateSnapConfigs,
    createSnapshot,
    updateSnapshot,
    saveSnapshotConfig,
    deleteSnapshot,
  };
};
