import { FC, useReducer, Dispatch, createContext } from "react";

import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface IRealEstateState {
  isListingsFetched: boolean;
  listings: ApiRealEstateListing[];
}

export const initialState: IRealEstateState = {
  isListingsFetched: false,
  listings: [],
};

export enum RealEstateActionTypeEnum {
  SET_REAL_ESTATES = "SET_REAL_ESTATES",
  PUT_REAL_ESTATE = "PUT_REAL_ESTATE",
  DELETE_REAL_ESTATE = "DELETE_REAL_ESTATE",
  SET_ESTATES_FETCHED = "SET_ESTATES_FETCHED",
}

type TRealEstateActionsPayload = {
  [RealEstateActionTypeEnum.SET_REAL_ESTATES]: ApiRealEstateListing[];
  [RealEstateActionTypeEnum.PUT_REAL_ESTATE]: ApiRealEstateListing;
  [RealEstateActionTypeEnum.DELETE_REAL_ESTATE]: Partial<ApiRealEstateListing>;
  [RealEstateActionTypeEnum.SET_ESTATES_FETCHED]: boolean;
};

export type RealEstateActions =
  ActionMap<TRealEstateActionsPayload>[keyof ActionMap<TRealEstateActionsPayload>];

const realEstateReducer = (
  state: IRealEstateState,
  action: RealEstateActions
): IRealEstateState => {
  switch (action.type) {
    case RealEstateActionTypeEnum.SET_REAL_ESTATES: {
      return { ...state, isListingsFetched: true, listings: action.payload };
    }
    case RealEstateActionTypeEnum.PUT_REAL_ESTATE: {
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
    case RealEstateActionTypeEnum.DELETE_REAL_ESTATE: {
      const listing = action.payload as ApiRealEstateListing;
      const listings = [...state.listings].filter((l) => l.id !== listing.id);

      return { ...state, listings };
    }
    case RealEstateActionTypeEnum.SET_ESTATES_FETCHED: {
      return { ...state, isListingsFetched: action.payload };
    }
    default:
      return state;
  }
};

export const RealEstateContext = createContext<{
  realEstateState: IRealEstateState;
  realEstateDispatch: Dispatch<RealEstateActions>;
}>({
  realEstateState: initialState,
  realEstateDispatch: () => undefined,
});

export const RealEstateContextProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(realEstateReducer, initialState);

  return (
    <RealEstateContext.Provider
      value={{ realEstateState: state, realEstateDispatch: dispatch }}
    >
      {children}
    </RealEstateContext.Provider>
  );
};
