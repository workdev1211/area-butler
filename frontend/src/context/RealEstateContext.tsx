import { FunctionComponent, useReducer, Dispatch, createContext } from "react";

import { ApiRealEstateListing } from "../../../shared/types/real-estate";

// TODO ADD A FLAG WHETHER OR NOT REAL ESTATES HAVE BEEN RETRIEVED

export interface RealEstateState {
  listings: ApiRealEstateListing[];
}

export const initialState: RealEstateState = {
  listings: [],
};

export enum RealEstateActionTypes {
  SET_REAL_ESTATES = "SET_REAL_ESTATES",
  PUT_REAL_ESTATE = "PUT_REAL_ESTATE",
  DELETE_REAL_ESTATE = "DELETE_REAL",
}

type RealEstateActionsPayload = {
  [RealEstateActionTypes.SET_REAL_ESTATES]: ApiRealEstateListing[];
  [RealEstateActionTypes.PUT_REAL_ESTATE]: ApiRealEstateListing;
  [RealEstateActionTypes.DELETE_REAL_ESTATE]: Partial<ApiRealEstateListing>;
};

export type RealEstateActions =
  ActionMap<RealEstateActionsPayload>[keyof ActionMap<RealEstateActionsPayload>];

const realEstateReducer = (
  state: RealEstateState,
  action: RealEstateActions
): RealEstateState => {
  switch (action.type) {
    case RealEstateActionTypes.SET_REAL_ESTATES: {
      return { ...state, listings: action.payload };
    }
    case RealEstateActionTypes.PUT_REAL_ESTATE: {
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
    case RealEstateActionTypes.DELETE_REAL_ESTATE: {
      const listing = action.payload as ApiRealEstateListing;
      const listings = [...state.listings].filter((l) => l.id !== listing.id);

      return { ...state, listings };
    }
    default:
      return state;
  }
};

export const RealEstateContext = createContext<{
  realEstateState: RealEstateState;
  realEstateDispatch: Dispatch<RealEstateActions>;
}>({
  realEstateState: initialState,
  realEstateDispatch: () => undefined,
});

export const RealEstateContextProvider: FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(realEstateReducer, initialState);

  return (
    <RealEstateContext.Provider
      value={{ realEstateState: state, realEstateDispatch: dispatch }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};
