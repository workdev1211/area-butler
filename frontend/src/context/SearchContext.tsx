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
  IIframeTokens,
  MeansOfTransportation,
  OsmName,
  TransportationParam,
} from "../../../shared/types/types";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { EntityGroup } from "../shared/search-result.types";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import { TCensusData } from "../../../shared/types/data-provision";
import { TLocationIndexData } from "../../../shared/types/location-index";
import { defaultTransportParams } from "../../../shared/constants/location";
import { OpenAiQueryTypeEnum } from "../../../shared/types/open-ai";
import { osmEntityTypes } from "../../../shared/constants/constants";

// TODO should be refactored in the future, it seems to be that 'zoomLevel' is not needed anymore
export interface MapClipping {
  zoomLevel?: number;
  mapClippingDataUrl: string;
}

interface IStoredContextState {
  preferredLocations?: ApiPreferredLocation[];
  routingProfiles?: TransportationParam[];
  preferredAmenities?: OsmName[];
  address?: string;
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
  highlightId?: string;
  printingActive: boolean;
  printingCheatsheetActive: boolean;
  printingDocxActive: boolean;
  printingZipActive: boolean;
  printingOnePageActive: boolean;
  mapClippings: MapClipping[];
  realEstateListing?: ApiRealEstateListing;
  responseGroupedEntities?: EntityGroup[];
  availGroupedEntities?: EntityGroup[];
  entityGroupsByActMeans: EntityGroup[];
  responseConfig?: ApiSearchResultSnapshotConfig;
  responseActiveMeans: MeansOfTransportation[];
  responseRoutes: EntityRoute[];
  responseTransitRoutes: EntityTransitRoute[];
  responseTokens?: Partial<IIframeTokens>;
  gotoMapCenter?: IGotoMapCenter;
  storedContextState?: IStoredContextState;
  snapshotId?: string;
  openAiQueryType?: OpenAiQueryTypeEnum;
  customPois?: ApiOsmLocation[];
}

export interface IGotoMapCenter {
  goto: boolean;
  withZoom?: boolean;
  animate?: boolean;
}

export const initialState: SearchContextState = {
  transportationParams: [...defaultTransportParams],
  localityParams: osmEntityTypes,
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
  entityGroupsByActMeans: [],
};

// TODO should be grouped and optimized
/*
  SET_AVAIL_GROUPED_ENTITIES // from the snapshot record
  SET_RESPONSE_GROUPED_ENTITIES // from the snapshot record filtered by visibility
  SET_ENT_GROUPS_BY_ACT_MEANS // from the snapshot record filtered by active transportation params (means)
  TOGGLE_SINGLE_RESPONSE_GROUP
  TOGGLE_RESPONSE_GROUP
 */

export enum SearchContextActionTypes {
  SET_PLACES_LOCATION = "SET_PLACES_LOCATION",
  SET_LOCATION = "SET_LOCATION",
  SET_TRANSPORTATION_PARAMS = "SET_TRANSPORTATION_PARAMS",
  SET_PREFERRED_LOCATIONS = "SET_PREFERRED_LOCATIONS",
  SET_LOCALITY_PARAMS = "SET_LOCALITY_PARAMS",
  SET_SEARCH_BUSY = "SET_SEARCH_BUSY",
  SET_SEARCH_RESPONSE = "SET_SEARCH_RESPONSE",
  SET_RESPONSE_GROUPED_ENTITIES = "SET_RESPONSE_GROUPED_ENTITIES",
  SET_AVAIL_GROUPED_ENTITIES = "SET_AVAIL_GROUPED_ENTITIES",
  SET_ENT_GROUPS_BY_ACT_MEANS = "SET_ENT_GROUPS_BY_ACT_MEANS",
  SET_RESPONSE_ACTIVE_MEANS = "SET_RESPONSE_ACTIVE_MEANS",
  SET_RESPONSE_ROUTES = "SET_RESPONSE_ROUTES",
  SET_RESPONSE_TRANSIT_ROUTES = "SET_RESPONSE_TRANSIT_ROUTES",
  SET_RESPONSE_TOKENS = "SET_RESPONSE_TOKENS",
  TOGGLE_SINGLE_RESPONSE_GROUP = "TOGGLE_SINGLE_RESPONSE_GROUP",
  TOGGLE_RESPONSE_GROUP = "TOGGLE_RESPONSE_GROUP",
  SET_RESPONSE_CONFIG = "SET_RESPONSE_CONFIG",
  SET_CENSUS_DATA = "SET_CENSUS_DATA",
  SET_FEDERAL_ELECTION_DATA = "SET_FEDERAL_ELECTION_DATA",
  SET_PARTICLE_POLLUTION_DATA = "SET_PARTICLE_POLLUTION_DATA",
  SET_LOCATION_INDEX_DATA = "SET_LOCATION_INDEX_DATA",
  SET_MAP_CENTER = "SET_MAP_CENTER",
  SET_MAP_ZOOM_LEVEL = "SET_MAP_ZOOM_LEVEL",
  SET_MAP_CENTER_ZOOM = "SET_MAP_CENTER_ZOOM",
  GOTO_MAP_CENTER = "GOTO_MAP_CENTER",
  SET_HIGHLIGHT_ID = "SET_HIGHLIGHT_ID",
  SET_PRINTING_ACTIVE = "SET_PRINTING_ACTIVE",
  SET_PRINTING_CHEATSHEET_ACTIVE = "SET_PRINTING_CHEATSHEET_ACTIVE",
  SET_PRINTING_DOCX_ACTIVE = "SET_PRINTING_DOCX_ACTIVE",
  SET_PRINTING_ZIP_ACTIVE = "SET_PRINTING_ZIP_ACTIVE",
  SET_PRINTING_ONE_PAGE_ACTIVE = "SET_PRINTING_ONE_PAGE_ACTIVE",
  ADD_MAP_CLIPPING = "ADD_MAP_CLIPPING",
  REMOVE_MAP_CLIPPING = "REMOVE_MAP_CLIPPING",
  CLEAR_MAP_CLIPPINGS = "CLEAR_MAP_CLIPPINGS",
  SET_REAL_ESTATE_LISTING = "SET_REAL_ESTATE_LISTING",
  ADD_CUSTOM_POI = "ADD_CUSTOM_POI",
  CLEAR_CUSTOM_POIS = "CLEAR_CUSTOM_POIS",
  SET_STORED_CONTEXT_STATE = "SET_STORED_CONTEXT_STATE",
  SET_SNAPSHOT_ID = "SET_SNAPSHOT_ID",
  SET_OPEN_AI_QUERY_TYPE = "SET_OPEN_AI_QUERY_TYPE",
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
  [SearchContextActionTypes.SET_AVAIL_GROUPED_ENTITIES]: EntityGroup[];
  [SearchContextActionTypes.SET_ENT_GROUPS_BY_ACT_MEANS]: EntityGroup[];
  [SearchContextActionTypes.SET_RESPONSE_ACTIVE_MEANS]: MeansOfTransportation[];
  [SearchContextActionTypes.TOGGLE_RESPONSE_GROUP]: OsmName;
  [SearchContextActionTypes.TOGGLE_SINGLE_RESPONSE_GROUP]: OsmName;
  [SearchContextActionTypes.SET_RESPONSE_ROUTES]: EntityRoute[];
  [SearchContextActionTypes.SET_RESPONSE_TOKENS]: Partial<IIframeTokens>;
  [SearchContextActionTypes.SET_RESPONSE_TRANSIT_ROUTES]: EntityTransitRoute[];
  [SearchContextActionTypes.SET_CENSUS_DATA]: TCensusData | undefined;
  [SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA]:
    | FederalElectionDistrict
    | undefined;
  [SearchContextActionTypes.SET_PARTICLE_POLLUTION_DATA]:
    | ApiGeojsonFeature[]
    | undefined;
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
  [SearchContextActionTypes.SET_HIGHLIGHT_ID]: string | undefined;
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
  [SearchContextActionTypes.ADD_CUSTOM_POI]: ApiOsmLocation;
  [SearchContextActionTypes.CLEAR_CUSTOM_POIS]: undefined;
  [SearchContextActionTypes.SET_STORED_CONTEXT_STATE]: IStoredContextState;
  [SearchContextActionTypes.SET_SNAPSHOT_ID]: string;
  [SearchContextActionTypes.SET_OPEN_AI_QUERY_TYPE]:
    | OpenAiQueryTypeEnum
    | undefined;
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
    case SearchContextActionTypes.SET_RESPONSE_TOKENS: {
      return {
        ...state,
        responseTokens: action.payload,
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
    case SearchContextActionTypes.SET_AVAIL_GROUPED_ENTITIES: {
      return {
        ...state,
        availGroupedEntities: [...action.payload],
      };
    }
    case SearchContextActionTypes.SET_ENT_GROUPS_BY_ACT_MEANS: {
      return {
        ...state,
        entityGroupsByActMeans: [...action.payload],
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
    case SearchContextActionTypes.SET_CENSUS_DATA: {
      return {
        ...state,
        censusData: action.payload ? { ...action.payload } : undefined,
      };
    }
    case SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA: {
      return {
        ...state,
        federalElectionData: action.payload ? { ...action.payload } : undefined,
      };
    }
    case SearchContextActionTypes.SET_PARTICLE_POLLUTION_DATA: {
      return {
        ...state,
        particlePollutionData: action.payload ? [...action.payload] : undefined,
      };
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
    case SearchContextActionTypes.SET_HIGHLIGHT_ID: {
      return { ...state, highlightId: action.payload };
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
    case SearchContextActionTypes.ADD_CUSTOM_POI: {
      return {
        ...state,
        customPois: Array.isArray(state.customPois)
          ? [...state.customPois, action.payload]
          : [action.payload],
      };
    }
    case SearchContextActionTypes.CLEAR_CUSTOM_POIS: {
      return {
        ...state,
        customPois: undefined,
      };
    }
    case SearchContextActionTypes.SET_STORED_CONTEXT_STATE: {
      return { ...state, storedContextState: action.payload };
    }
    case SearchContextActionTypes.SET_SNAPSHOT_ID: {
      return { ...state, snapshotId: action.payload };
    }
    case SearchContextActionTypes.SET_OPEN_AI_QUERY_TYPE: {
      return { ...state, openAiQueryType: action.payload };
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
