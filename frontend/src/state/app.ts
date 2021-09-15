import { AreaSearchState, initialState as areaSearchInitialState } from "./area-search";
import {
  PotentialCustomerState,
  initialState as potentialCustomersInitialState,
} from "./potential-customer";
import {
  RealEstateListingState,
  initialState as realEstateListingsInitialState,
} from "./real-estate-listing";

export interface AppState {
  listings: RealEstateListingState;
  potentialCustomers: PotentialCustomerState;
  areaSearch: AreaSearchState;
}

export const initialState: AppState = {
  listings: realEstateListingsInitialState,
  potentialCustomers: potentialCustomersInitialState,
  areaSearch: areaSearchInitialState
};
