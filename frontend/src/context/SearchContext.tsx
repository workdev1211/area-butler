import React from "react";
import { osmEntityTypes } from "../../../shared/constants/constants";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import {
    ApiCoordinates, ApiGeometry,
    ApiOsmEntity,
    ApiSearchResponse,
    OsmName,
    TransportationParam
} from "../../../shared/types/types";
import { defaultTransportationParams } from "../components/TransportationParams";

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
    censusData?: ApiGeometry[];
    mapCenter?: ApiCoordinates;
    mapZoomLevel?: number;
    highlightId?: number;
    printingActive: boolean;
    printingCheatsheetActive: boolean;
    mapClippings: MapClipping[];
}

export const initialState: SearchContextState = {
    transportationParams: [...defaultTransportationParams],
    localityParams: osmEntityTypes.filter(entity =>
        [
            OsmName.fuel, OsmName.park, OsmName.kiosk, OsmName.supermarket, OsmName.school, OsmName.restaurant
        ].includes(entity.name)),
    searchBusy: false,
    printingActive: false,
    printingCheatsheetActive: false,
    mapClippings: [],
};

export enum SearchContextActions {
    SET_PLACES_LOCATION = 'SET_PLACES_LOCATION',
    SET_LOCATION = 'SET_LOCATION',
    SET_TRANSPORTATION_PARAMS = 'SET_TRANSPORTATION_PARAMS',
    SET_PREFERRED_LOCATIONS = 'SET_PREFERRED_LOCATIONS',
    SET_LOCALITY_PARAMS = 'SET_LOCALITY_PARAMS',
    SET_SEARCH_BUSY = 'SET_SEARCH_BUSY',
    SET_SEARCH_RESPONSE = 'SET_SEARCH_RESPONSE',
    SET_ZENSUS_DATA = "SET_ZENSUS_DATA",
    SET_MAP_CENTER = 'SET_MAP_CENTER',
    SET_MAP_ZOOM_LEVEL = 'SET_MAP_ZOOM_LEVEL',
    CENTER_ZOOM_COORDINATES = 'CENTER_ZOOM_COORDINATES',
    SET_HIGHLIGHT_ID = 'SET_HIGHLIGHT_ID',
    SET_PRINTING_ACTIVE = 'SET_PRINTING_ACTIVE',
    SET_PRINTING_CHEATSHEET_ACTIVE = 'SET_PRINTING_CHEATSHEET_ACTIVE',
    ADD_MAP_CLIPPING = 'ADD_MAP_CLIPPING',
    CLEAR_MAP_CLIPPINGS = 'CLEAR_MAP_CLIPPINGS',
    SET_REAL_ESTATE_LISTING = 'SET_REAL_ESTATE_LISTING',
}

const reducer: (
    state: SearchContextState,
    action: { type: SearchContextActions; payload?: any }
) => SearchContextState = (state, action) => {
    switch (action.type) {
        case SearchContextActions.SET_PLACES_LOCATION: {
            return {...state, placesLocation: {...action.payload}};
        }
        case SearchContextActions.SET_LOCATION: {
            return {...state, location: {...action.payload}};
        }
        case SearchContextActions.SET_TRANSPORTATION_PARAMS: {
            return {...state, transportationParams: [...action.payload]}
        }
        case SearchContextActions.SET_PREFERRED_LOCATIONS: {
            return {...state, preferredLocations: [...action.payload]};
        }
        case SearchContextActions.SET_LOCALITY_PARAMS: {
            return {...state, localityParams: [...action.payload]};
        }
        case SearchContextActions.SET_SEARCH_BUSY: {
            return {...state, searchBusy: action.payload}
        }
        case SearchContextActions.SET_SEARCH_RESPONSE: {
            return {...state, searchResponse: {...action.payload}, location: action.payload.centerOfInterest.coordinates}
        }
        case SearchContextActions.SET_ZENSUS_DATA: {
            return {...state, censusData: [...action.payload]}
        }
        case SearchContextActions.SET_MAP_ZOOM_LEVEL: {
            return {...state, mapZoomLevel: action.payload};
        }
        case SearchContextActions.SET_MAP_CENTER: {
            return {...state, mapCenter: action.payload}
        }
        case SearchContextActions.CENTER_ZOOM_COORDINATES: {
            return {...state, mapZoomLevel: action.payload.zoom, mapCenter: action.payload.center}
        }
        case SearchContextActions.SET_HIGHLIGHT_ID: {
            return {...state, highlightId: action.payload}
        }
        case SearchContextActions.SET_PRINTING_ACTIVE: {
            return {...state, printingActive: action.payload, mapCenter: state.searchResponse?.centerOfInterest.coordinates};
        }
        case SearchContextActions.SET_PRINTING_CHEATSHEET_ACTIVE: {
            return {...state, printingCheatsheetActive: action.payload, mapCenter: state.searchResponse?.centerOfInterest.coordinates};
        }
        case SearchContextActions.ADD_MAP_CLIPPING: {
            const newMapClippings = [...(state.mapClippings || [])];
            newMapClippings.push(action.payload);
            return {...state, mapClippings: newMapClippings};
        }
        case SearchContextActions.CLEAR_MAP_CLIPPINGS: {
            return {...state, mapClippings: []};
        }
        case SearchContextActions.SET_REAL_ESTATE_LISTING: {
            return {...state, realEstateListing: {...action.payload}};
        }
        default:
            return state;
    }
};

export const SearchContext = React.createContext<{
    searchContextState: any;
    searchContextDispatch: (action: { type: SearchContextActions, payload?: any }) => void;
}>({
    searchContextState: initialState, searchContextDispatch: () => {
    }
});

export const SearchContextProvider = ({
                                          children,
                                      }: {
    children: any;
}) => {
    const [state, dispatch] = React.useReducer<any>(reducer, initialState);

    return (
        <SearchContext.Provider
            value={{searchContextState: state, searchContextDispatch: dispatch}}
        >
            {children}
        </SearchContext.Provider>
    );
};
