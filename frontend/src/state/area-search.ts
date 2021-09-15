import { useAppState } from "@laststance/use-app-state";
import {
  ApiCoordinates,
  ApiIsochrone,
  ApiOsmEntity,
  ApiSearchResponse,
  OsmName,
  TransportationParam,
} from "../../../shared/types/types";
import { AppState } from "./app";

export interface AreaSearchState {
  routingProfiles: TransportationParam[];
  preferredAmenities: OsmName[];
  location?: ApiCoordinates;
  response?: ApiSearchResponse;
}

export const initialState: AreaSearchState = {
  routingProfiles: [],
  preferredAmenities: [],
};

export const useAreaSearchState = () => {
  const [appState, setAppState] = useAppState<AppState>();

  const areaSearchState = appState.areaSearch;

  const setRoutingProfiles = (routingProfiles: TransportationParam[]) => {
    setAppState({
      ...appState,
      areaSearch: { ...appState.areaSearch, routingProfiles },
    });
  };

  const setPreferredAmenities = (preferredAmenities: OsmName[]) => {
    setAppState({
      ...appState,
      areaSearch: { ...appState.areaSearch, preferredAmenities },
    });
  };

  const setLocation = (location: ApiCoordinates) => {
    setAppState({
      ...appState,
      areaSearch: { ...appState.areaSearch, location },
    });
  };
  const setSearchResponse = (response: ApiSearchResponse) => {
    setAppState({
      ...appState,
      areaSearch: { ...appState.areaSearch, response },
    });
  };


  return {areaSearchState, setRoutingProfiles, setPreferredAmenities, setLocation, setSearchResponse}

};
