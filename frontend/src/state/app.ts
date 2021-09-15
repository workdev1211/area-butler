import {
  AreaSearchState,
  initialState as areaSearchInitialState,
} from "./area-search";

export interface AppState {
  areaSearch: AreaSearchState;
}

export const initialState: AppState = {
  areaSearch: areaSearchInitialState,
};
