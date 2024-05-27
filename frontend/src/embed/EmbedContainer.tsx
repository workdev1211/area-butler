import { FC, MouseEvent, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";

import "./EmbedContainer.scss";

import {
  IApiFetchedEmbeddedData,
  MapDisplayModesEnum,
} from "../../../shared/types/types";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import SearchResultContainer from "../components/search-result-container/SearchResultContainer";
import { ICurrentMapRef } from "../shared/search-result.types";
import {
  RealEstateActionTypeEnum,
  RealEstateContext,
} from "../context/RealEstateContext";
import {
  addressExpiredMessage,
  subscriptionExpiredMessage,
} from "../../../shared/messages/error.message";
import { getCombinedOsmEntityTypes } from "../../../shared/functions/shared.functions";
import { defaultMapZoom } from "../shared/shared.constants";
import { deriveInitialEntityGroups } from "../shared/pois.functions";

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

const EmbedContainer: FC = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);

  const [embeddedData, setEmbeddedData] = useState<IApiFetchedEmbeddedData>();
  const [isAddressExpired, setIsAddressExpired] = useState(false);
  const [mapDisplayMode, setMapDisplayMode] = useState<MapDisplayModesEnum>();

  const getQueryVariable = (variable: string): string | undefined => {
    const query = window.location.search.substring(1);
    const vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");

      if (pair[0] === variable) {
        return pair[1];
      }
    }

    return;
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") {
        return;
      }

      if (mapRef.current?.handleScrollWheelZoom.isScrollWheelZoomEnabled()) {
        mapRef.current?.handleScrollWheelZoom.disableScrollWheelZoom();
      }

      if (mapRef.current?.handleDragging.isDraggingEnabled()) {
        mapRef.current?.handleDragging.disableDragging();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch saved response
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const baseUrl = process.env.REACT_APP_BASE_URL || "";

      try {
        const fetchedEmbeddedData = (
          await axios.get<IApiFetchedEmbeddedData>(
            `${baseUrl}/api/location/embedded/iframe/${getQueryVariable(
              "token"
            )}`
          )
        ).data;

        const config = fetchedEmbeddedData.snapshotRes.config;

        if (config && !("showAddress" in config)) {
          config["showAddress"] = true;
        }

        if (config && !("showStreetViewLink" in config)) {
          config["showStreetViewLink"] = true;
        }

        setEmbeddedData(fetchedEmbeddedData);
      } catch (e: any) {
        const { statusCode, message } = e.response.data;

        setIsAddressExpired(
          statusCode === 402 &&
            [addressExpiredMessage, subscriptionExpiredMessage].includes(
              message
            )
        );
      }
    };

    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!embeddedData) {
      return;
    }

    const {
      realEstates,
      snapshotRes: { config, snapshot },
    } = embeddedData;

    if (!config) {
      return;
    }

    const {
      searchResponse,
      transportationParams,
      localityParams,
      location,
      placesLocation,
      preferredLocations = [],
      routes = [],
      transitRoutes = [],
    } = snapshot;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_SEARCH_RESPONSE,
      payload: searchResponse,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: transportationParams,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
      payload: getCombinedOsmEntityTypes(localityParams),
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: placesLocation,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: location,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_MAP_ZOOM_LEVEL,
      payload: config.zoomLevel || defaultMapZoom,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: preferredLocations,
    });

    if (realEstates?.length) {
      realEstateDispatch({
        type: RealEstateActionTypeEnum.SET_REAL_ESTATES,
        payload: realEstates,
      });
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_ROUTES,
      payload: routes,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES,
      payload: transitRoutes,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_CONFIG,
      payload: { ...config },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_TOKEN,
      payload: embeddedData.snapshotRes.token,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups({
        config,
        preferredLocations,
        realEstates,
        searchResponse,
      }),
    });

    setMapDisplayMode(MapDisplayModesEnum.EMBED);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embeddedData]);

  const handleClick = (): void => {
    if (
      mapRef.current &&
      !mapRef.current?.handleScrollWheelZoom.isScrollWheelZoomEnabled()
    ) {
      mapRef.current?.handleScrollWheelZoom.enableScrollWheelZoom();
    }

    if (mapRef.current && !mapRef.current?.handleDragging.isDraggingEnabled()) {
      mapRef.current?.handleDragging.enableDragging();
    }
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();

    if (
      mapRef.current &&
      mapRef.current?.handleScrollWheelZoom.isScrollWheelZoomEnabled()
    ) {
      mapRef.current?.handleScrollWheelZoom.disableScrollWheelZoom();
    }

    if (mapRef.current && mapRef.current?.handleDragging.isDraggingEnabled()) {
      mapRef.current?.handleDragging.disableDragging();
    }
  };

  if (!searchContextState.searchResponse || !mapDisplayMode || !embeddedData) {
    return isAddressExpired ? (
      <div>{`Ihre Adresse ist abgelaufen. Bitte besuchen Sie die ${process.env.REACT_APP_BASE_URL} und verlängern Sie sie.`}</div>
    ) : (
      <div>Loading...</div>
    );
  }

  return (
    <div onClick={handleClick} onContextMenu={handleContextMenu}>
      <SearchResultContainer
        mapboxAccessToken={embeddedData.snapshotRes.mapboxAccessToken}
        searchResponse={searchContextState.searchResponse}
        searchAddress={searchContextState.placesLocation?.label}
        location={searchContextState.mapCenter ?? searchContextState.location!}
        isTrial={!!embeddedData.snapshotRes.isTrial}
        userPoiIcons={embeddedData.userPoiIcons}
        mapDisplayMode={mapDisplayMode}
        ref={mapRef}
      />
    </div>
  );
};

export default EmbedContainer;
