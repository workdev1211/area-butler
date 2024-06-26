import { FC, useContext, useEffect, useState } from "react";

import { IntegrationTypesEnum } from "../../../../../shared/types/integration";
import MyVivendaMapMenu, {
  TMyVivendaMapMenuProps,
} from "../../../my-vivenda/components/MyVivendaMapMenu";
import MapMenu from "../../../map-menu/MapMenu";
import { UserActionTypes, UserContext } from "../../../context/UserContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../context/SearchContext";
import { ConfigContext } from "../../../context/ConfigContext";
import {
  ApiCoordinates,
  ApiSearchResultSnapshotConfig,
  IApiUserPoiIcons,
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../../shared/types/types";
import {
  EntityGroup,
  ICurrentMapRef,
  IEditorTabProps,
  IExportTabProps,
  ResultEntity,
} from "../../../shared/search-result.types";
import { useTools } from "../../../hooks/tools";
import {
  deriveAvailableMeansFromResponse,
  preferredLocationsTitle,
} from "../../../shared/shared.functions";
import { realEstateListingsTitle } from "../../../../../shared/constants/real-estate";

interface IMapMenuContainerProps {
  isMapMenuOpen: boolean;
  isNewSnapshot: boolean;
  mapDisplayMode: MapDisplayModesEnum;
  mapRef: ICurrentMapRef | null;
  resultGroupEntities: EntityGroup[];
  toggleRoutesToEntity: (
    origin: ApiCoordinates,
    item: ResultEntity,
    mean: MeansOfTransportation
  ) => void;
  toggleTransitRoutesToEntity: (
    origin: ApiCoordinates,
    item: ResultEntity
  ) => void;

  saveConfig?: () => Promise<void>;
  userPoiIcons?: IApiUserPoiIcons;
}

const MapMenuContainer: FC<IMapMenuContainerProps> = ({
  isMapMenuOpen,
  isNewSnapshot,
  mapDisplayMode,
  mapRef,
  resultGroupEntities,
  saveConfig,
  toggleRoutesToEntity,
  toggleTransitRoutesToEntity,
  userPoiIcons,
}) => {
  const {
    searchContextDispatch,
    searchContextState: {
      availGroupedEntities,
      censusData,
      federalElectionData,
      location,
      locationIndexData,
      mapCenter,
      mapZoomLevel,
      particlePollutionData,
      placesLocation,
      responseConfig,
      responseGroupedEntities,
      responseRoutes,
      responseTokens,
      responseTransitRoutes,
      searchResponse,
      snapshotId,
    },
  } = useContext(SearchContext);

  const { integrationType } = useContext(ConfigContext);
  const { userDispatch } = useContext(UserContext);
  const { getActualUser } = useTools();

  const [editorTabProps, setEditorTabProps] = useState<IEditorTabProps>();
  const [exportTabProps, setExportTabProps] = useState<IExportTabProps>();

  const searchAddress = placesLocation?.label;
  const resultLocation = mapCenter ?? location!;

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;
  const extraMapboxStyles = isIntegrationUser
    ? user.config.extraMapboxStyles
    : user.extraMapboxStyles;

  useEffect(() => {
    if (
      mapDisplayMode !== MapDisplayModesEnum.EDITOR ||
      !availGroupedEntities?.length ||
      !responseConfig ||
      !snapshotId ||
      !mapRef
    ) {
      return;
    }

    const handleConfigChange = (
      config: ApiSearchResultSnapshotConfig
    ): void => {
      if (
        responseConfig.mapBoxMapId !== config.mapBoxMapId ||
        responseConfig.showLocation !== config.showLocation ||
        responseConfig.showAddress !== config.showAddress
      ) {
        const resultMapCenter = mapRef.getCenter() || mapCenter;
        const resultMapZoomLevel = mapRef.getZoom() || mapZoomLevel;

        if (resultMapCenter && resultMapZoomLevel) {
          searchContextDispatch({
            type: SearchContextActionTypes.SET_MAP_CENTER_ZOOM,
            payload: {
              mapCenter: resultMapCenter,
              mapZoomLevel: resultMapZoomLevel,
            },
          });
        }
      }

      searchContextDispatch({
        type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
        payload: { ...config },
      });
    };

    setEditorTabProps({
      extraMapboxStyles,
      isNewSnapshot,
      snapshotId,
      availableMeans: deriveAvailableMeansFromResponse(searchResponse),
      config: responseConfig,
      groupedEntries: availGroupedEntities,
      onConfigChange: handleConfigChange,
    });

    setExportTabProps({
      searchAddress,
      snapshotId,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availGroupedEntities,
    extraMapboxStyles,
    isNewSnapshot,
    mapCenter,
    mapDisplayMode,
    mapRef,
    mapZoomLevel,
    responseConfig,
    responseTokens,
    searchAddress,
    searchResponse,
    snapshotId,
  ]);

  const toggleAllLocalities = (): void => {
    const oldGroupedEntities = responseGroupedEntities ?? [];

    if (!oldGroupedEntities.length) {
      return;
    }

    let resRespGroupEntities: EntityGroup[];
    const isToggled = oldGroupedEntities.some(({ active }) => active);

    switch (responseConfig?.theme) {
      case "KF": {
        if (isToggled) {
          resRespGroupEntities = oldGroupedEntities.map((entityGroup) => ({
            ...entityGroup,
            active: false,
          }));
          break;
        }

        const hasMainKfCategories = oldGroupedEntities.some(({ title }) =>
          [preferredLocationsTitle, realEstateListingsTitle].includes(title)
        );

        if (!hasMainKfCategories) {
          resRespGroupEntities = [...oldGroupedEntities];
          resRespGroupEntities[0].active = true;
          break;
        }

        resRespGroupEntities = oldGroupedEntities.map((entityGroup) => ({
          ...entityGroup,
          active: [preferredLocationsTitle, realEstateListingsTitle].includes(
            entityGroup.title
          ),
        }));
        break;
      }

      default: {
        resRespGroupEntities = oldGroupedEntities.map((entityGroup) => ({
          ...entityGroup,
          active: !isToggled,
        }));
      }
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: resRespGroupEntities,
    });
  };

  const myVivendaMapMenuProps: TMyVivendaMapMenuProps = {
    isMapMenuOpen,
    searchAddress,
    config: responseConfig,
    groupedEntries: resultGroupEntities ?? [],
    resetPosition: () => {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_MAP_CENTER,
        payload: searchResponse?.centerOfInterest?.coordinates!,
      });

      searchContextDispatch({
        type: SearchContextActionTypes.GOTO_MAP_CENTER,
        payload: { goto: true },
      });
    },
    routes: responseRoutes,
    toggleAllLocalities,
    toggleRoute: (item, mean) =>
      toggleRoutesToEntity(resultLocation, item, mean),
    toggleTransitRoute: (item) =>
      toggleTransitRoutesToEntity(resultLocation, item),
    transitRoutes: responseTransitRoutes,
    userMenuPoiIcons: userPoiIcons?.menuPoiIcons,
  };

  if (integrationType === IntegrationTypesEnum.MY_VIVENDA) {
    return <MyVivendaMapMenu {...myVivendaMapMenuProps} />;
  }

  return (
    <MapMenu
      censusData={censusData}
      editorTabProps={editorTabProps}
      exportTabProps={exportTabProps}
      federalElectionData={federalElectionData}
      locationIndexData={locationIndexData}
      mapDisplayMode={mapDisplayMode}
      openUpgradeSubscriptionModal={(message) => {
        userDispatch({
          type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
          payload: { open: true, message },
        });
      }}
      particlePollutionData={particlePollutionData}
      saveConfig={saveConfig}
      showInsights={mapDisplayMode === MapDisplayModesEnum.EDITOR}
      {...myVivendaMapMenuProps}
    />
  );
};

export default MapMenuContainer;
