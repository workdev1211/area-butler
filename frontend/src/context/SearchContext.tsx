import { FunctionComponent, Dispatch, useReducer, createContext } from "react";

import { FederalElectionDistrict } from "hooks/federalelectiondata";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import {
  ApiCoordinates,
  ApiGeojsonFeature,
  ApiOsmEntity,
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation,
  TransportationParam,
} from "../../../shared/types/types";
import { defaultTransportationParams } from "../components/TransportationParams";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { TCensusData } from "../hooks/censusdata";
import { EntityGroup } from "../components/SearchResultContainer";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import { getCombinedOsmEntityTypes } from "../../../shared/functions/shared.functions";
import { TLocationIndexData } from "../hooks/locationindexdata";

export interface MapClipping {
  zoomLevel: number;
  mapClippingDataUrl: string;
}

export interface SearchContextState {
  placesLocation?: any;
  location?: ApiCoordinates;
  transportationParams: TransportationParam[];
  preferredLocations?: ApiPreferredLocation[];
  localityParams: ApiOsmEntity[];
  searchBusy: boolean;
  searchResponse?: ApiSearchResponse;
  censusData?: TCensusData;
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  locationIndexData?: TLocationIndexData;
  mapCenter?: ApiCoordinates;
  mapZoomLevel?: number;
  printingActive: boolean;
  printingCheatsheetActive: boolean;
  printingDocxActive: boolean;
  printingZipActive: boolean;
  printingOnePageActive: boolean;
  mapClippings: MapClipping[];
  realEstateListing?: ApiRealEstateListing;
  responseGroupedEntities?: EntityGroup[];
  responseConfig?: ApiSearchResultSnapshotConfig;
  responseActiveMeans: MeansOfTransportation[];
  responseRoutes: EntityRoute[];
  responseTransitRoutes: EntityTransitRoute[];
  responseToken: string;
  gotoMapCenter?: IGotoMapCenter;
  integrationId?: string;
  integrationSnapshotId?: string;
}

export interface IGotoMapCenter {
  goto: boolean;
  withZoom?: boolean;
  animate?: boolean;
}

export const initialState: SearchContextState = {
  transportationParams: [...defaultTransportationParams],
  localityParams: [...getCombinedOsmEntityTypes()],
  searchBusy: false,
  printingActive: false,
  printingCheatsheetActive: false,
  printingDocxActive: false,
  printingZipActive: false,
  printingOnePageActive: false,
  mapClippings: [],
  responseActiveMeans: [],
  responseRoutes: [],
  responseTransitRoutes: [],
  responseToken: "",
};

export enum SearchContextActionTypes {
  SET_PLACES_LOCATION = "SET_PLACES_LOCATION",
  SET_LOCATION = "SET_LOCATION",
  SET_TRANSPORTATION_PARAMS = "SET_TRANSPORTATION_PARAMS",
  SET_PREFERRED_LOCATIONS = "SET_PREFERRED_LOCATIONS",
  SET_LOCALITY_PARAMS = "SET_LOCALITY_PARAMS",
  SET_SEARCH_BUSY = "SET_SEARCH_BUSY",
  SET_SEARCH_RESPONSE = "SET_SEARCH_RESPONSE",
  SET_RESPONSE_GROUPED_ENTITIES = "SET_RESPONSE_GROUPED_ENTITIES",
  SET_RESPONSE_ACTIVE_MEANS = "SET_RESPONSE_ACTIVE_MEANS",
  SET_RESPONSE_ROUTES = "SET_RESPONSE_ROUTES",
  SET_RESPONSE_TRANSIT_ROUTES = "SET_RESPONSE_TRANSIT_ROUTES",
  SET_RESPONSE_TOKEN = "SET_RESPONSE_TOKEN",
  TOGGLE_SINGLE_RESPONSE_GROUP = "TOGGLE_SINGLE_RESPONSE_GROUP",
  TOGGLE_RESPONSE_GROUP = "TOGGLE_RESPONSE_GROUP",
  SET_RESPONSE_CONFIG = "SET_RESPONSE_CONFIG",
  SET_ZENSUS_DATA = "SET_ZENSUS_DATA",
  SET_FEDERAL_ELECTION_DATA = "SET_FEDERAL_ELECTION_DATA",
  SET_PARTICLE_POLLUTION_ELECTION_DATA = "SET_PARTICLE_POLLUTION_ELECTION_DATA",
  SET_LOCATION_INDEX_DATA = "SET_LOCATION_INDEX_DATA",
  SET_MAP_CENTER = "SET_MAP_CENTER",
  SET_MAP_ZOOM_LEVEL = "SET_MAP_ZOOM_LEVEL",
  SET_MAP_CENTER_ZOOM = "SET_MAP_CENTER_ZOOM",
  GOTO_MAP_CENTER = "GOTO_MAP_CENTER",
  SET_PRINTING_ACTIVE = "SET_PRINTING_ACTIVE",
  SET_PRINTING_CHEATSHEET_ACTIVE = "SET_PRINTING_CHEATSHEET_ACTIVE",
  SET_PRINTING_DOCX_ACTIVE = "SET_PRINTING_DOCX_ACTIVE",
  SET_PRINTING_ZIP_ACTIVE = "SET_PRINTING_ZIP_ACTIVE",
  SET_PRINTING_ONE_PAGE_ACTIVE = "SET_PRINTING_ONE_PAGE_ACTIVE",
  ADD_MAP_CLIPPING = "ADD_MAP_CLIPPING",
  REMOVE_MAP_CLIPPING = "REMOVE_MAP_CLIPPING",
  CLEAR_MAP_CLIPPINGS = "CLEAR_MAP_CLIPPINGS",
  SET_REAL_ESTATE_LISTING = "SET_REAL_ESTATE_LISTING",
  CLEAR_REAL_ESTATE_LISTING = "CLEAR_REAL_ESTATE_LISTING",
  ADD_POI_TO_SEARCH_RESPONSE = "ADD_POI_TO_SEARCH_RESPONSE",
  SET_INTEGRATION_ID = "SET_INTEGRATION_ID",
  SET_INTEGRATION_SNAPSHOT_ID = "SET_INTEGRATION_SNAPSHOT_ID",
}

type SearchContextActionsPayload = {
  [SearchContextActionTypes.SET_PLACES_LOCATION]:
    | Record<string, any>
    | undefined;
  [SearchContextActionTypes.SET_LOCATION]: ApiCoordinates | undefined;
  [SearchContextActionTypes.SET_TRANSPORTATION_PARAMS]: TransportationParam[];
  [SearchContextActionTypes.SET_PREFERRED_LOCATIONS]: ApiPreferredLocation[];
  [SearchContextActionTypes.SET_LOCALITY_PARAMS]: ApiOsmEntity[];
  [SearchContextActionTypes.SET_SEARCH_BUSY]: boolean;
  [SearchContextActionTypes.SET_SEARCH_RESPONSE]: ApiSearchResponse;
  [SearchContextActionTypes.SET_RESPONSE_CONFIG]:
    | ApiSearchResultSnapshotConfig
    | undefined;
  [SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES]: EntityGroup[];
  [SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS]: MeansOfTransportation[];
  [SearchContextActionTypes.TOGGLE_RESPONSE_GROUP]: string;
  [SearchContextActionTypes.TOGGLE_SINGLE_RESPONSE_GROUP]: string;
  [SearchContextActionTypes.SET_RESPONSE_ROUTES]: EntityRoute[];
  [SearchContextActionTypes.SET_RESPONSE_TOKEN]: string;
  [SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES]: EntityTransitRoute[];
  [SearchContextActionTypes.SET_ZENSUS_DATA]: TCensusData;
  [SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA]: FederalElectionDistrict;
  [SearchContextActionTypes.SET_PARTICLE_POLLUTION_ELECTION_DATA]: ApiGeojsonFeature[];
  [SearchContextActionTypes.SET_LOCATION_INDEX_DATA]:
    | TLocationIndexData
    | undefined;
  [SearchContextActionTypes.SET_MAP_CENTER]: ApiCoordinates;
  [SearchContextActionTypes.SET_MAP_ZOOM_LEVEL]: number;
  [SearchContextActionTypes.SET_MAP_CENTER_ZOOM]: {
    mapCenter: ApiCoordinates;
    mapZoomLevel: number;
  };
  [SearchContextActionTypes.GOTO_MAP_CENTER]: IGotoMapCenter | undefined;
  [SearchContextActionTypes.SET_PRINTING_ACTIVE]: boolean;
  [SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE]: boolean;
  [SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE]: boolean;
  [SearchContextActionTypes.SET_PRINTING_ZIP_ACTIVE]: boolean;
  [SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE]: boolean;
  [SearchContextActionTypes.ADD_MAP_CLIPPING]: MapClipping;
  [SearchContextActionTypes.REMOVE_MAP_CLIPPING]: MapClipping;
  [SearchContextActionTypes.CLEAR_MAP_CLIPPINGS]: undefined;
  [SearchContextActionTypes.SET_REAL_ESTATE_LISTING]:
    | ApiRealEstateListing
    | undefined;
  [SearchContextActionTypes.CLEAR_REAL_ESTATE_LISTING]: undefined;
  [SearchContextActionTypes.ADD_POI_TO_SEARCH_RESPONSE]: ApiOsmLocation;
  [SearchContextActionTypes.SET_INTEGRATION_ID]: string;
  [SearchContextActionTypes.SET_INTEGRATION_SNAPSHOT_ID]: string;
};

export type SearchContextActions =
  ActionMap<SearchContextActionsPayload>[keyof ActionMap<SearchContextActionsPayload>];

export const searchContextReducer = (
  state: SearchContextState,
  action: SearchContextActions
): SearchContextState => {
  switch (action.type) {
    case SearchContextActionTypes.SET_PLACES_LOCATION: {
      return {
        ...state,
        placesLocation: action.payload ? { ...action.payload } : undefined,
      };
    }
    case SearchContextActionTypes.SET_LOCATION: {
      return {
        ...state,
        location: action.payload ? { ...action.payload } : undefined,
      };
    }
    case SearchContextActionTypes.SET_TRANSPORTATION_PARAMS: {
      return { ...state, transportationParams: [...action.payload] };
    }
    case SearchContextActionTypes.SET_PREFERRED_LOCATIONS: {
      return { ...state, preferredLocations: [...action.payload] };
    }
    case SearchContextActionTypes.SET_LOCALITY_PARAMS: {
      return { ...state, localityParams: [...action.payload] };
    }
    case SearchContextActionTypes.SET_SEARCH_BUSY: {
      return { ...state, searchBusy: action.payload };
    }
    case SearchContextActionTypes.SET_SEARCH_RESPONSE: {
      return {
        ...state,
        searchResponse: { ...action.payload },
        location: action.payload?.centerOfInterest?.coordinates,
        mapCenter: action.payload?.centerOfInterest?.coordinates,
      };
    }
    case SearchContextActionTypes.SET_RESPONSE_CONFIG: {
      return {
        ...state,
        responseConfig: !!action.payload ? { ...action.payload } : undefined,
      };
    }
    case SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS: {
      return {
        ...state,
        responseActiveMeans: [...action.payload],
      };
    }
    case SearchContextActionTypes.SET_RESPONSE_TOKEN: {
      return {
        ...state,
        responseToken: action.payload,
      };
    }
    case SearchContextActionTypes.SET_RESPONSE_ROUTES: {
      return {
        ...state,
        responseRoutes: [...action.payload],
      };
    }
    case SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES: {
      return {
        ...state,
        responseTransitRoutes: [...action.payload],
      };
    }
    case SearchContextActionTypes.SET_RESPONSE_GROUPED_ENTITIES: {
      return {
        ...state,
        responseGroupedEntities: [...action.payload],
      };
    }
    case SearchContextActionTypes.TOGGLE_SINGLE_RESPONSE_GROUP: {
      return {
        ...state,
        responseGroupedEntities: (state.responseGroupedEntities ?? []).map(
          (g) =>
            g.title === action.payload
              ? { ...g, active: true }
              : { ...g, active: false }
        ),
      };
    }
    case SearchContextActionTypes.TOGGLE_RESPONSE_GROUP: {
      return {
        ...state,
        responseGroupedEntities: (state.responseGroupedEntities ?? []).map(
          (g) => (g.title === action.payload ? { ...g, active: !g.active } : g)
        ),
      };
    }
    case SearchContextActionTypes.SET_ZENSUS_DATA: {
      return { ...state, censusData: { ...action.payload } };
    }
    case SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA: {
      return { ...state, federalElectionData: { ...action.payload } };
    }
    case SearchContextActionTypes.SET_PARTICLE_POLLUTION_ELECTION_DATA: {
      return { ...state, particlePollutionData: [...action.payload] };
    }
    case SearchContextActionTypes.SET_LOCATION_INDEX_DATA: {
      return {
        ...state,
        locationIndexData: action.payload ? { ...action.payload } : undefined,
      };
    }
    case SearchContextActionTypes.SET_MAP_CENTER: {
      return { ...state, mapCenter: action.payload };
    }
    case SearchContextActionTypes.SET_MAP_ZOOM_LEVEL: {
      return { ...state, mapZoomLevel: action.payload };
    }
    case SearchContextActionTypes.SET_MAP_CENTER_ZOOM: {
      return {
        ...state,
        mapCenter: action.payload.mapCenter,
        mapZoomLevel: action.payload.mapZoomLevel,
      };
    }
    case SearchContextActionTypes.GOTO_MAP_CENTER: {
      return { ...state, gotoMapCenter: action.payload };
    }
    case SearchContextActionTypes.SET_PRINTING_ACTIVE: {
      return {
        ...state,
        printingActive: action.payload,
        mapCenter: state.searchResponse?.centerOfInterest.coordinates,
      };
    }
    case SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE: {
      return {
        ...state,
        printingCheatsheetActive: action.payload,
        mapCenter: state.searchResponse?.centerOfInterest.coordinates,
      };
    }
    case SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE: {
      return {
        ...state,
        printingDocxActive: action.payload,
        mapCenter: state.searchResponse?.centerOfInterest.coordinates,
      };
    }
    case SearchContextActionTypes.SET_PRINTING_ZIP_ACTIVE: {
      return {
        ...state,
        printingZipActive: action.payload,
      };
    }
    case SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE: {
      return {
        ...state,
        printingOnePageActive: action.payload,
      };
    }
    case SearchContextActionTypes.ADD_MAP_CLIPPING: {
      const newMapClippings = [...(state.mapClippings || [])];
      newMapClippings.push(action.payload);
      return { ...state, mapClippings: newMapClippings };
    }
    case SearchContextActionTypes.REMOVE_MAP_CLIPPING: {
      const newMapClippings = [...(state.mapClippings || [])].filter(
        (c) => c.mapClippingDataUrl !== action.payload.mapClippingDataUrl
      );
      return { ...state, mapClippings: newMapClippings };
    }
    case SearchContextActionTypes.CLEAR_MAP_CLIPPINGS: {
      return { ...state, mapClippings: [] };
    }
    case SearchContextActionTypes.SET_REAL_ESTATE_LISTING: {
      return {
        ...state,
        realEstateListing: action.payload ? { ...action.payload } : undefined,
      };
    }
    case SearchContextActionTypes.CLEAR_REAL_ESTATE_LISTING: {
      return { ...state, realEstateListing: undefined };
    }
    case SearchContextActionTypes.ADD_POI_TO_SEARCH_RESPONSE: {
      const poi: ApiOsmLocation = action.payload;

      const searchResponse = JSON.parse(
        JSON.stringify(state.searchResponse)
      ) as ApiSearchResponse;
      searchResponse?.routingProfiles?.WALK?.locationsOfInterest?.push(
        poi as any as ApiOsmLocation
      );
      searchResponse?.routingProfiles?.BICYCLE?.locationsOfInterest?.push(
        poi as any as ApiOsmLocation
      );
      searchResponse?.routingProfiles?.CAR?.locationsOfInterest?.push(
        poi as any as ApiOsmLocation
      );

      return { ...state, searchResponse };
    }
    case SearchContextActionTypes.SET_INTEGRATION_ID: {
      return { ...state, integrationId: action.payload };
    }
    case SearchContextActionTypes.SET_INTEGRATION_SNAPSHOT_ID: {
      return { ...state, integrationSnapshotId: action.payload };
    }
    default:
      return state;
  }
};

export const SearchContext = createContext<{
  searchContextState: SearchContextState;
  searchContextDispatch: Dispatch<SearchContextActions>;
}>({
  searchContextState: initialState,
  searchContextDispatch: () => undefined,
});

export const SearchContextProvider: FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(searchContextReducer, initialState);

  return (
    <SearchContext.Provider
      value={{ searchContextState: state, searchContextDispatch: dispatch }}
    >
      {children}
    </SearchContext.Provider>
  );
};
