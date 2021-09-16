import React from "react";
import {
    ApiCoordinates, ApiSearchResponse,
    MeansOfTransportation, OsmName,
    TransportationParam,
    UnitsOfTransportation
} from "../../../shared/types/types";
import {osmEntityTypes} from "../../../shared/constants/constants";

export interface SearchContextState {
    placesLocation?: any;
    location?: ApiCoordinates;
    transportationParams: TransportationParam[];
    localityOptions: OsmName[];
    searchResponse?: ApiSearchResponse;
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
    localityOptions: osmEntityTypes.filter(entity =>
        [
            OsmName.fuel, OsmName.park, OsmName.kiosk, OsmName.supermarket, OsmName.school, OsmName.restaurant
        ].includes(entity.name)).map((entity) => entity.name)
};

export enum SearchContextActions {
    SET_PLACES_LOCATION = 'SET_PLACES_LOCATION',
    SET_LOCATION = 'SET_LOCATION',
    SET_TRANSPORTATION_PARAMS = 'SET_TRANSPORTATION_PARAMS',
    SET_LOCALITY_OPTIONS = 'SET_LOCALITY_OPTIONS',
    SET_SEARCH_RESPONSE = 'SET_SEARCH_RESPONSE',
}

const reducer: (
    state: SearchContextState,
    action: { type: SearchContextActions; payload?: any }
) => SearchContextState = (state, action) => {
    switch (action.type) {
        case SearchContextActions.SET_PLACES_LOCATION: {
            return {...state, placesLocation: {...action.payload} };
        }
        case SearchContextActions.SET_LOCATION: {
            return { ...state, location: {...action.payload }};
        }
        case SearchContextActions.SET_TRANSPORTATION_PARAMS: {
            return { ...state, transportationParams: [...action.payload]}
        }
        case SearchContextActions.SET_LOCALITY_OPTIONS: {
            return { ...state, localityOptions: [...action.payload]}
        }
        case SearchContextActions.SET_SEARCH_RESPONSE: {
            return { ...state, searchResponse: {...action.payload}}
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
