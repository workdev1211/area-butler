import React from "react";
import {
    ApiCoordinates,
    ApiGeometry,
    ApiSearchResponse,
    MeansOfTransportation,
    OsmName,
    TransportationParam,
    UnitsOfTransportation
} from "../../../shared/types/types";
import {osmEntityTypes} from "../../../shared/constants/constants";
import {ApiPreferredLocation} from "../../../shared/types/potential-customer";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";

export interface MapClipping {
    zoomLevel: number;
    mapClippingDataUrl: string;
}

export interface SearchContextState {
    placesLocation?: any;
    location?: ApiCoordinates;
    realEstateListing?: ApiRealEstateListing;
    selectedCenter?: ApiCoordinates;
    selectedZoomLevel?: number;
    printingActive?: boolean;
    transportationParams: TransportationParam[];
    localityOptions: OsmName[];
    searchResponse?: ApiSearchResponse;
    realEstateListings?: ApiRealEstateListing[];
    preferredLocations?: ApiPreferredLocation[];
    mapClippings?: MapClipping[];
    censusData?: ApiGeometry[];
}

export const initialState: SearchContextState = {
    transportationParams: [
        {
            type: MeansOfTransportation.WALK,
            amount: 5,
            unit: UnitsOfTransportation.MINUTES,
        },
        {
            type: MeansOfTransportation.BICYCLE,
            amount: 15,
            unit: UnitsOfTransportation.MINUTES,
        },
        {
            type: MeansOfTransportation.CAR,
            amount: 30,
            unit: UnitsOfTransportation.MINUTES,
        },
    ],
    printingActive: false,
    mapClippings: [],
    localityOptions: osmEntityTypes.filter(entity =>
        [
            OsmName.fuel, OsmName.park, OsmName.kiosk, OsmName.supermarket, OsmName.school, OsmName.restaurant
        ].includes(entity.name)).map((entity) => entity.name)
};

export enum SearchContextActions {
    SET_REAL_ESTATE_LISTING = 'SET_REAL_ESTATE_LISTING',
    SET_PLACES_LOCATION = 'SET_PLACES_LOCATION',
    SET_LOCATION = 'SET_LOCATION',
    SET_SELECTED_CENTER = 'SET_SELECTED_CENTER',
    SET_SELECTED_ZOOM_LEVEL = 'SET_SELECTED_ZOOM_LEVEL',
    CENTER_ZOOM_COORDINATES = 'CENTER_ZOOM_COORDINATES',
    SET_PRINTING_ACTIVE = 'SET_PRINTING_ACTIVE',
    SET_PREFERRED_LOCATIONS = 'SET_PREFERRED_LOCATIONS',
    SET_TRANSPORTATION_PARAMS = 'SET_TRANSPORTATION_PARAMS',
    SET_LOCALITY_OPTIONS = 'SET_LOCALITY_OPTIONS',
    SET_SEARCH_RESPONSE = 'SET_SEARCH_RESPONSE',
    ADD_MAP_CLIPPING = 'ADD_MAP_CLIPPING',
    CLEAR_MAP_CLIPPINGS = 'CLEAR_MAP_CLIPPINGS',
    SET_ZENSUS_DATA = "SET_ZENSUS_DATA",
}

const reducer: (
    state: SearchContextState,
    action: { type: SearchContextActions; payload?: any }
) => SearchContextState = (state, action) => {
    switch (action.type) {
        case SearchContextActions.SET_REAL_ESTATE_LISTING: {
            return {...state, realEstateListing: {...action.payload}};
        }
        case SearchContextActions.SET_PLACES_LOCATION: {
            return {...state, placesLocation: {...action.payload}};
        }
        case SearchContextActions.SET_LOCATION: {
            return {...state, location: {...action.payload}};
        }
        case SearchContextActions.SET_SELECTED_CENTER: {
            return {...state, selectedCenter: {...action.payload}};
        }
        case SearchContextActions.SET_SELECTED_ZOOM_LEVEL: {
            return {...state, selectedZoomLevel: action.payload};
        }
        case SearchContextActions.CENTER_ZOOM_COORDINATES: {
            return {...state, selectedZoomLevel: action.payload.zoom, selectedCenter: action.payload.center}
        }
        case SearchContextActions.SET_PRINTING_ACTIVE: {
            return {...state, printingActive: action.payload};
        }
        case SearchContextActions.SET_PREFERRED_LOCATIONS: {
            return {...state, preferredLocations: [...action.payload]};
        }
        case SearchContextActions.SET_TRANSPORTATION_PARAMS: {
            return {...state, transportationParams: [...action.payload]}
        }
        case SearchContextActions.SET_LOCALITY_OPTIONS: {
            return {...state, localityOptions: [...action.payload]}
        }
        case SearchContextActions.SET_SEARCH_RESPONSE: {
            return {...state, searchResponse: {...action.payload}}
        }
        case SearchContextActions.ADD_MAP_CLIPPING: {
            const newMapClippings = [...(state.mapClippings || [])];
            newMapClippings.push(action.payload);
            return {...state, mapClippings: newMapClippings};
        }
        case SearchContextActions.CLEAR_MAP_CLIPPINGS: {
            return {...state, mapClippings: []};
        }
        case SearchContextActions.SET_ZENSUS_DATA: {
            return {...state, censusData: [...action.payload]}
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
