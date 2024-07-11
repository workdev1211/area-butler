import { RefObject, useContext } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

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
  TPoiGroupName,
} from "../../../shared/types/types";
import { ICurrentMapRef } from "../shared/search-result.types";
import { toastError, toastSuccess } from "../shared/shared.functions";
import { IApiLateSnapConfigOption } from "../../../shared/types/location";
import { ConfigContext } from "../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../shared/types/integration";

export const useLocationData = () => {
  const { t } = useTranslation();
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
    let url: string;

    if (isIntegration) {
      url =
        integrationType === IntegrationTypesEnum.MY_VIVENDA
          ? `/api/location-myv/snapshot/${snapshotId}`
          : `/api/location-int/snapshot/${snapshotId}`;
    } else {
      url = `/api/location/snapshot/${snapshotId}`;
    }

    return (await get<ApiSearchResultSnapshotResponse>(url)).data;
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
    if (integrationType === IntegrationTypesEnum.MY_VIVENDA) {
      return [];
    }

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
    toastSuccess(t(IntlKeys.mapSnapshots.duplicateCardSuccessfully));

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
          realEstateId: searchContextState.realEstateListing?.id, // to check if real estate belongs to the user
          snapshot: {
            searchResponse,
            location: searchContextState.location!,
            localityParams: searchContextState.localityParams,
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

    const defaultActiveGroups: TPoiGroupName[] = [];
    const customPoiIds: string[] = [];

    searchContextState.responseGroupedEntities?.forEach(
      ({ active, items, name }) => {
        if (active) {
          defaultActiveGroups.push(name);
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

      toastSuccess(t(IntlKeys.mapSnapshots.settingSaved));

      return snapshotResponse;
    } catch (e) {
      toastError(t(IntlKeys.mapSnapshots.settingSavingError));
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
