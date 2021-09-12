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
}

export const initialState: AppState = {
  listings: realEstateListingsInitialState,
  potentialCustomers: potentialCustomersInitialState,
};
