import {
  RealEstateListingState,
  initialState as realEstateListingsInitialState,
} from "./real-estate-listing";

export interface AppState {
  listings: RealEstateListingState;
}

export const initialState: AppState = {
  listings: realEstateListingsInitialState,
};
