import { AreaSearchState, initialState as areaSearchInitialState } from "./area-search";
import {
  PotentialCustomerState,
  initialState as potentialCustomersInitialState,
} from "./potential-customer";

export interface AppState {
  potentialCustomers: PotentialCustomerState;
  areaSearch: AreaSearchState;
}

export const initialState: AppState = {
  potentialCustomers: potentialCustomersInitialState,
  areaSearch: areaSearchInitialState
};
