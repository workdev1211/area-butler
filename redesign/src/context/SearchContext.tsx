import React from "react";
import {ApiCoordinates, TransportationParam} from "../../../shared/types/types";
import {defaultTransportationParams} from "../components/TransportationParams";

export interface SearchContextState {
    placesLocation?: any;
    location?: ApiCoordinates;
    transportationParams: TransportationParam[];
}

export const initialState: SearchContextState = {
    transportationParams: [...defaultTransportationParams]
};

export enum SearchContextActions {
    SET_PLACES_LOCATION = 'SET_PLACES_LOCATION',
    SET_LOCATION = 'SET_LOCATION',
    SET_TRANSPORTATION_PARAMS = 'SET_TRANSPORTATION_PARAMS',
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
