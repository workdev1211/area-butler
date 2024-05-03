import { RefObject, useContext } from "react";
import { AxiosResponse } from "axios";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import { useHttp } from "./http";
import {
  ApiCreateSnapshotReq,
  ApiSearch,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  ApiUpdateSearchResultSnapshot,
} from "../../../shared/types/types";
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

  const duplicateSnapshot = async (
    snapshotId: string
  ): Promise<ApiSearchResultSnapshotResponse> => {
    const duplicatedSnapshot = (
      await post<ApiSearchResultSnapshotResponse>(
        isIntegration
          ? `/api/location-int/snapshot/${snapshotId}`
          : `/api/location/snapshot/${snapshotId}`
      )
    ).data;

    toastSuccess("Das Duplizieren der Karte war erfolgreich.");

    return duplicatedSnapshot;
  };

  const createSnapshot = async (
    searchResponse: ApiSearchResponse
  ): Promise<ApiSearchResultSnapshotResponse> => {
    return (
      await post<ApiSearchResultSnapshotResponse, ApiCreateSnapshotReq>(
        isIntegration ? "/api/location-int/snapshot" : "/api/location/snapshot",
        {
          integrationId: searchContextState.realEstateListing?.integrationId,
          snapshot: {
            searchResponse,
            location: searchContextState.location!,
            localityParams: getUncombinedOsmEntityTypes(
              searchContextState.localityParams
            ),
            placesLocation: searchContextState.placesLocation,
            preferredLocations: searchContextState.preferredLocations,
            transportationParams: searchContextState.transportationParams,
          },
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

    const defaultActiveGroups: string[] = [];
    const customPoiIds: string[] = [];

    searchContextState.responseGroupedEntities?.forEach(
      ({ title, active, items }) => {
        if (active) {
          defaultActiveGroups.push(title);
        }

        items.forEach(({ id, isCustom }) => {
          if (isCustom) {
            customPoiIds.push(id);
          }
        });
      }
    );

    const config: ApiSearchResultSnapshotConfig = {
      ...searchContextState.responseConfig,
      defaultActiveGroups,
      defaultActiveMeans: searchContextState.responseActiveMeans,
    };

    const customPois = searchContextState.customPois?.filter(
      ({ entity: { id } }) => customPoiIds.includes(id!)
    );

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
        customPois,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.CLEAR_CUSTOM_POIS,
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
    duplicateSnapshot,
    createSnapshot,
    updateSnapshot,
    saveSnapshotConfig,
    deleteSnapshot,
  };
};
