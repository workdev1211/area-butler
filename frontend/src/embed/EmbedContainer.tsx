import {
  FunctionComponent,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";

import "./EmbedContainer.scss";
import {
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
  IApiUserPoiIcons,
} from "../../../shared/types/types";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import SearchResultContainer, {
  ICurrentMapRef,
} from "../components/SearchResultContainer";
import { deriveInitialEntityGroups } from "../shared/shared.functions";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import {
  addressExpiredMessage,
  subscriptionExpiredMessage,
} from "../../../shared/messages/error.message";
import { ApiRealEstateStatusEnum } from "../../../shared/types/real-estate";
import { getCombinedOsmEntityTypes } from "../../../shared/functions/shared.functions";
import { defaultMapZoom } from "../shared/shared.constants";

window.addEventListener("resize", () => {
  calculateViewHeight();
});

const calculateViewHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

calculateViewHeight();

const EmbedContainer: FunctionComponent = () => {
  const mapRef = useRef<ICurrentMapRef | null>(null);

  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { realEstateDispatch } = useContext(RealEstateContext);

  const [result, setResult] = useState<ApiSearchResultSnapshotResponse>();
  const [isAddressExpired, setIsAddressExpired] = useState(false);
  const [mapBoxToken, setMapBoxToken] = useState("");
  const [searchConfig, setSearchConfig] =
    useState<ApiSearchResultSnapshotConfig>();
  const [userPoiIcons, setUserPoiIcons] = useState<IApiUserPoiIcons>();

  const getQueryVariable = (variable: string) => {
    const query = window.location.search.substring(1);
    const vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");

      if (pair[0] === variable) {
        return pair[1];
      }
    }

    return undefined;
  };

  useEffect(() => {
    const handleEscape = async (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        mapRef.current?.handleScrollWheelZoom.isScrollWheelZoomEnabled()
      ) {
        mapRef.current?.handleScrollWheelZoom.disableScrollWheelZoom();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch saved response
  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = process.env.REACT_APP_BASE_URL || "";

      try {
        const response = (
          await axios.get<ApiSearchResultSnapshotResponse>(
            `${baseUrl}/api/location/snapshot/iframe/${getQueryVariable(
              "token"
            )}`
          )
        ).data;

        const config = response.config;

        if (config && !("showAddress" in config)) {
          config["showAddress"] = true;
        }

        if (config && !("showStreetViewLink" in config)) {
          config["showStreetViewLink"] = true;
        }

        setMapBoxToken(response.mapboxToken);
        setResult(response);
        setSearchConfig(config);
        setUserPoiIcons(response.userPoiIcons);
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
  }, [
    setMapBoxToken,
    setResult,
    setSearchConfig,
    setUserPoiIcons,
    searchContextDispatch,
  ]);

  useEffect(() => {
    if (!result || !searchConfig) {
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
      realEstateListings = [],
    } = result.snapshot;

    const filteredRealEstateListings = searchConfig.realEstateStatus
      ? realEstateListings.filter(
          ({ status }) =>
            searchConfig.realEstateStatus === ApiRealEstateStatusEnum.ALLE ||
            status === searchConfig.realEstateStatus
        )
      : realEstateListings;

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
      payload: searchConfig.zoomLevel || defaultMapZoom,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: preferredLocations,
    });

    realEstateDispatch({
      type: RealEstateActionTypes.SET_REAL_ESTATES,
      payload: realEstateListings,
    });

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
      payload: { ...searchConfig },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_TOKEN,
      payload: result.token,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES,
      payload: deriveInitialEntityGroups(
        searchResponse,
        searchConfig,
        filteredRealEstateListings,
        preferredLocations
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, searchConfig, searchContextDispatch]);

  const handleClick = () => {
    if (
      mapRef.current &&
      !mapRef.current?.handleScrollWheelZoom.isScrollWheelZoomEnabled()
    ) {
      mapRef.current?.handleScrollWheelZoom.enableScrollWheelZoom();
    }
  };

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (
      mapRef.current &&
      mapRef.current?.handleScrollWheelZoom.isScrollWheelZoomEnabled()
    ) {
      mapRef.current?.handleScrollWheelZoom.disableScrollWheelZoom();
    }
  };

  if (!searchContextState.searchResponse) {
    return isAddressExpired ? (
      <div>{`Ihre Adresse ist abgelaufen. Bitte besuchen Sie die ${process.env.REACT_APP_BASE_URL} und verlängern Sie sie.`}</div>
    ) : (
      <div>Loading...</div>
    );
  }

  return (
    <div onClick={handleClick} onContextMenu={handleContextMenu}>
      <SearchResultContainer
        mapBoxToken={mapBoxToken}
        mapBoxMapId={searchConfig?.mapBoxMapId}
        searchResponse={searchContextState.searchResponse}
        placesLocation={searchContextState.placesLocation}
        location={searchContextState.mapCenter ?? searchContextState.location!}
        isTrial={!!result?.isTrial}
        userPoiIcons={userPoiIcons}
        embedMode={true}
        ref={mapRef}
      />
    </div>
  );
};

export default EmbedContainer;
