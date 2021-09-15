import React from "react";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface RealEstateListingState {
  listings: ApiRealEstateListing[];
}

export const initialState: RealEstateListingState = {
  listings: [],
};

export enum RealEstateListingActions {
  SET_REAL_ESTATE_LISTINGS = "SET_REAL_ESTATE_LISTINGS",
  PUT_REAL_ESTATE_LISTING = "PUT_REAL_ESTATE_LISTING",
}

const reducer: (
  state: RealEstateListingState,
  action: { type: RealEstateListingActions; payload?: any }
) => RealEstateListingState = (state, action) => {
  switch (action.type) {
    case RealEstateListingActions.SET_REAL_ESTATE_LISTINGS: {
      return {...state, listings: action.payload};
    }
    case RealEstateListingActions.PUT_REAL_ESTATE_LISTING: {
        const listing = action.payload as ApiRealEstateListing;
        const listings = [...state.listings];
        const listingIndex = listings.map((l) => l.id).indexOf(listing.id);
        if (listingIndex !== -1) {
          listings[listingIndex] = listing;
        } else {
          listings.push(listing);
        }
      return {...state, listings};
    }
    default:
      return state;
  }
};

export const RealEstateListingContext = React.createContext<{
  realEstateListingState: any;
  realEstateDispatch: (action: {type: RealEstateListingActions, payload?: any}) => void;
}>({ realEstateListingState: initialState, realEstateDispatch: () => {} });

export const RealEstateListingContextProvider = ({
  children,
}: {
  children: any;
}) => {
  const [state, dispatch] = React.useReducer<any>(reducer, initialState);

  return (
    <RealEstateListingContext.Provider
      value={{ realEstateListingState: state, realEstateDispatch: dispatch }}
    >
      {children}
    </RealEstateListingContext.Provider>
  );
};
