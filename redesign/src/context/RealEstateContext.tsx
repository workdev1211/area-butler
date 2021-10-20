import React from "react";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface RealEstateState {
  listings: ApiRealEstateListing[];
}

export const initialState: RealEstateState = {
  listings: [],
};

export enum RealEstateActions {
  SET_REAL_ESTATES = "SET_REAL_ESTATES",
  PUT_REAL_ESTATE = "PUT_REAL_ESTATE",
  DELETE_REAL_ESTATE = "DELETE_REAL",
}

const reducer: (
  state: RealEstateState,
  action: { type: RealEstateActions; payload?: any }
) => RealEstateState = (state, action) => {
  switch (action.type) {
    case RealEstateActions.SET_REAL_ESTATES: {
      return { ...state, listings: action.payload };
    }
    case RealEstateActions.PUT_REAL_ESTATE: {
      const listing = action.payload as ApiRealEstateListing;
      const listings = [...state.listings];
      const listingIndex = listings.map((l) => l.id).indexOf(listing.id);
      if (listingIndex !== -1) {
        listings[listingIndex] = listing;
      } else {
        listings.push(listing);
      }
      return { ...state, listings };
    }
    case RealEstateActions.DELETE_REAL_ESTATE: {
      const listing = action.payload as ApiRealEstateListing;
      const listings = [...state.listings].filter((l) => l.id !== listing.id);
      return { ...state, listings };
    }
    default:
      return state;
  }
};

export const RealEstateContext = React.createContext<{
  realEstateState: any;
  realEstateDispatch: (action: {
    type: RealEstateActions;
    payload?: any;
  }) => void;
}>({ realEstateState: initialState, realEstateDispatch: () => {} });

export const RealEstateContextProvider = ({
  children,
}: {
  children: any;
}) => {
  const [state, dispatch] = React.useReducer<any>(reducer, initialState);

  return (
    <RealEstateContext.Provider
      value={{ realEstateState: state, realEstateDispatch: dispatch }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};
