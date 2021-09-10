import { useAppState } from "@laststance/use-app-state";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { AppState } from "./app";

export interface RealEstateListingState {
  listings: ApiRealEstateListing[];
}

export const initialState : RealEstateListingState = {
  listings: []
}

export const useRealEstateListingState = () => {
  const [appState, setAppState] = useAppState<AppState>();

  const setRealEstateListings = (listings: ApiRealEstateListing[]) => {
    setAppState({ ...appState, listings: {listings} });
  };

  const realEstateListingsState = appState.listings;

  return { realEstateListingsState, setRealEstateListings };
};

export default useRealEstateListingState;
