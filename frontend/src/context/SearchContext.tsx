import { FederalElectionDistrict } from "hooks/federalelectiondata";
import React, { Dispatch } from "react";
import { osmEntityTypes } from "../../../shared/constants/constants";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import {
  ApiCoordinates,
  ApiGeojsonFeature,
  ApiOsmEntity,
  ApiOsmLocation,
  ApiSearchResponse,
  ApiSearchResultSnapshotConfig,
  MeansOfTransportation,
  OsmName,
  TransportationParam,
} from "../../../shared/types/types";
import { defaultTransportationParams } from "../components/TransportationParams";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { CensusData } from "../hooks/censusdata";
import { EntityGroup } from "../components/SearchResultContainer";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";

export interface MapClipping {
  zoomLevel: number;
  mapClippingDataUrl: string;
}

export interface Poi {
  address: { street: string };
  coordinates: ApiCoordinates;
  distanceInMeters: number;
  entity: {
    id: string;
    name: string;
    label: string;
    type: OsmName;
  };
}

export interface SearchContextState {
  placesLocation?: any;
  location?: ApiCoordinates;
  transportationParams: TransportationParam[];
  preferredLocations?: ApiPreferredLocation[];
  localityParams: ApiOsmEntity[];
  searchBusy: boolean;
  searchResponse?: ApiSearchResponse;
  censusData?: CensusData[];
  federalElectionData?: FederalElectionDistrict;
  particlePollutionData?: ApiGeojsonFeature[];
  mapCenter?: ApiCoordinates;
  mapZoomLevel?: number;
  highlightId?: string | null;
  printingActive: boolean;
  printingCheatsheetActive: boolean;
  printingDocxActive: boolean;
  printingZipActive: boolean;
  mapClippings: MapClipping[];
  realEstateListing?: ApiRealEstateListing;
  responseGroupedEntities?: EntityGroup[];
  responseConfig?: ApiSearchResultSnapshotConfig;
  responseActiveMeans: MeansOfTransportation[];
  responseRoutes: EntityRoute[];
  responseTransitRoutes: EntityTransitRoute[];
  responseToken: string;
  gotoMapCenter?: IGotoMapCenter;
}

interface IGotoMapCenter {
  goto: boolean;
  withZoom?: boolean;
}

export const initialState: SearchContextState = {
  transportationParams: [...defaultTransportationParams],
  localityParams: [...osmEntityTypes],
  searchBusy: false,
  printingActive: false,
  printingCheatsheetActive: false,
  printingDocxActive: false,
  printingZipActive: false,
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
  SET_MAP_CENTER = "SET_MAP_CENTER",
  SET_MAP_ZOOM_LEVEL = "SET_MAP_ZOOM_LEVEL",
  SET_MAP_CENTER_ZOOM = "SET_MAP_CENTER_ZOOM",
  GOTO_MAP_CENTER = "GOTO_MAP_CENTER",
  SET_HIGHLIGHT_ID = "SET_HIGHLIGHT_ID",
  SET_PRINTING_ACTIVE = "SET_PRINTING_ACTIVE",
  SET_PRINTING_CHEATSHEET_ACTIVE = "SET_PRINTING_CHEATSHEET_ACTIVE",
  SET_PRINTING_DOCX_ACTIVE = "SET_PRINTING_DOCX_ACTIVE",
  SET_PRINTING_ZIP_ACTIVE = "SET_PRINTING_ZIP_ACTIVE",
  ADD_MAP_CLIPPING = "ADD_MAP_CLIPPING",
  REMOVE_MAP_CLIPPING = "REMOVE_MAP_CLIPPING",
  CLEAR_MAP_CLIPPINGS = "CLEAR_MAP_CLIPPINGS",
  SET_REAL_ESTATE_LISTING = "SET_REAL_ESTATE_LISTING",
  CLEAR_REAL_ESTATE_LISTING = "CLEAR_REAL_ESTATE_LISTING",
  ADD_POI_TO_SEARCH_RESPONSE = "ADD_POI_TO_SEARCH_RESPONSE",
}

type SearchContextActionsPayload = {
  [SearchContextActionTypes.SET_PLACES_LOCATION]: Record<string, any>;
  [SearchContextActionTypes.SET_LOCATION]: ApiCoordinates;
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
  [SearchContextActionTypes.SET_ZENSUS_DATA]: CensusData[];
  [SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA]: FederalElectionDistrict;
  [SearchContextActionTypes.SET_PARTICLE_POLLUTION_ELECTION_DATA]: ApiGeojsonFeature[];
  [SearchContextActionTypes.SET_MAP_CENTER]: ApiCoordinates;
  [SearchContextActionTypes.SET_MAP_ZOOM_LEVEL]: number;
  [SearchContextActionTypes.SET_MAP_CENTER_ZOOM]: {
    zoom: number;
    center: ApiCoordinates;
  };
  [SearchContextActionTypes.GOTO_MAP_CENTER]: IGotoMapCenter | undefined;
  [SearchContextActionTypes.SET_HIGHLIGHT_ID]: string | null;
  [SearchContextActionTypes.SET_PRINTING_ACTIVE]: boolean;
  [SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE]: boolean;
  [SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE]: boolean;
  [SearchContextActionTypes.SET_PRINTING_ZIP_ACTIVE]: boolean;
  [SearchContextActionTypes.ADD_MAP_CLIPPING]: MapClipping;
  [SearchContextActionTypes.REMOVE_MAP_CLIPPING]: MapClipping;
  [SearchContextActionTypes.CLEAR_MAP_CLIPPINGS]: undefined;
  [SearchContextActionTypes.SET_REAL_ESTATE_LISTING]: ApiRealEstateListing;
  [SearchContextActionTypes.CLEAR_REAL_ESTATE_LISTING]: undefined;
  [SearchContextActionTypes.ADD_POI_TO_SEARCH_RESPONSE]: Poi;
};

export type SearchContextActions =
  ActionMap<SearchContextActionsPayload>[keyof ActionMap<SearchContextActionsPayload>];

export const searchContextReducer = (
  state: SearchContextState,
  action: SearchContextActions
): SearchContextState => {
  switch (action.type) {
    case SearchContextActionTypes.SET_PLACES_LOCATION: {
      return { ...state, placesLocation: { ...action.payload } };
    }
    case SearchContextActionTypes.SET_LOCATION: {
      return { ...state, location: { ...action.payload } };
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
      return { ...state, censusData: [...action.payload] };
    }
    case SearchContextActionTypes.SET_FEDERAL_ELECTION_DATA: {
      return { ...state, federalElectionData: { ...action.payload } };
    }
    case SearchContextActionTypes.SET_PARTICLE_POLLUTION_ELECTION_DATA: {
      return { ...state, particlePollutionData: [...action.payload] };
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
        mapZoomLevel: action.payload.zoom,
        mapCenter: action.payload.center,
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
      return { ...state, realEstateListing: { ...action.payload } };
    }
    case SearchContextActionTypes.CLEAR_REAL_ESTATE_LISTING: {
      return { ...state, realEstateListing: undefined };
    }
    case SearchContextActionTypes.ADD_POI_TO_SEARCH_RESPONSE: {
      const poi: Poi = action.payload;

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
    default:
      return state;
  }
};

export const SearchContext = React.createContext<{
  searchContextState: SearchContextState;
  searchContextDispatch: Dispatch<SearchContextActions>;
}>({
  searchContextState: initialState,
  searchContextDispatch: () => undefined,
});

export const SearchContextProvider: React.FunctionComponent = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(
    searchContextReducer,
    initialState
  );

  return (
    <SearchContext.Provider
      value={{ searchContextState: state, searchContextDispatch: dispatch }}
    >
      {children}
    </SearchContext.Provider>
  );
};
