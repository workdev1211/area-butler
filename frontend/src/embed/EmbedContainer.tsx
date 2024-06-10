import { FC, MouseEvent, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

import "./EmbedContainer.scss";

import {
  IApiFetchedEmbeddedData,
  MapDisplayModesEnum,
  ResultStatusEnum,
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
import { getCombinedOsmEntityTypes } from "../../../shared/functions/shared.functions";
import { defaultMapZoom } from "../shared/shared.constants";
import { deriveInitialEntityGroups } from "../shared/pois.functions";
import { getQueryParamsAndUrl } from "../shared/shared.functions";
import { IFetchEmbedMapQueryParams } from "../../../shared/types/location";
import { ILoginStatus } from "../shared/shared.types";
import { IntlKeys } from "../i18n/keys";
import { Loading } from "../components/Loading";
import { boolStringMapping } from "../../../shared/constants/constants";

const queryParamsSchema: Yup.ObjectSchema<IFetchEmbedMapQueryParams> =
  Yup.object({
    token: Yup.string().required(),
    isAddressShown: Yup.mixed<string>().oneOf(Object.keys(boolStringMapping)),
  });

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

const appUrl = process.env.REACT_APP_BASE_URL;

const EmbedContainer: FC = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);
  const { t } = useTranslation();

  const [embeddedData, setEmbeddedData] = useState<IApiFetchedEmbeddedData>();
  const [mapDisplayMode, setMapDisplayMode] = useState<MapDisplayModesEnum>();
  const [loginStatus, setLoginStatus] = useState<ILoginStatus>();

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
      const queryParamsAndUrl =
        getQueryParamsAndUrl<IFetchEmbedMapQueryParams>();

      if (!queryParamsAndUrl || !appUrl) {
        setLoginStatus({ requestStatus: ResultStatusEnum.FAILURE });
        return;
      }

      try {
        await queryParamsSchema.validate(queryParamsAndUrl.queryParams);

        const {
          queryParams: { token, isAddressShown },
        } = queryParamsAndUrl;

        const resIsAddressShown = isAddressShown
          ? boolStringMapping[isAddressShown]
          : undefined;

        let url = `${appUrl}/api/location/embedded/iframe?token=${token}`;

        if (typeof resIsAddressShown === "boolean") {
          url += `&isAddressShown=${isAddressShown}`;
        }

        const fetchedEmbeddedData = (
          await axios.get<IApiFetchedEmbeddedData>(url)
        ).data;

        const config = fetchedEmbeddedData.snapshotRes.config;

        if (config) {
          config.showAddress =
            typeof resIsAddressShown === "boolean"
              ? resIsAddressShown
              : !!config.showAddress;

          if (!("showStreetViewLink" in config)) {
            config.showStreetViewLink = true;
          }
        }

        setEmbeddedData(fetchedEmbeddedData);
      } catch (e: any) {
        console.error(e);

        if (!e?.response?.data) {
          setLoginStatus({ requestStatus: ResultStatusEnum.FAILURE });
          return;
        }

        const { statusCode, message } = e.response.data;

        setLoginStatus({
          message:
            statusCode !== 402
              ? message
              : t(IntlKeys.common.addressExpired, {
                  appUrl: encodeURI(appUrl),
                  interpolation: { escapeValue: false },
                }),
          requestStatus: ResultStatusEnum.FAILURE,
        });
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
      snapshotRes: { addressToken, config, snapshot, token, unaddressToken },
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
      type: SearchContextActionTypes.SET_RESPONSE_TOKENS,
      payload: { addressToken, token, unaddressToken },
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

    setMapDisplayMode(MapDisplayModesEnum.EMBEDDED);

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
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        {loginStatus?.requestStatus === ResultStatusEnum.FAILURE ? (
          loginStatus.message || t(IntlKeys.common.errorOccurred)
        ) : (
          <Loading />
        )}
      </div>
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
