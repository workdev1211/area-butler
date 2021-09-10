import { useAppState } from "@laststance/use-app-state";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { AppState } from "./app";

export interface RealEstateListingState {
  listings: ApiRealEstateListing[];
}

export const initialState: RealEstateListingState = {
  listings: [],
};

export const useRealEstateListingState = () => {
  const [appState, setAppState] = useAppState<AppState>();

  const realEstateListingsState = appState.listings;

  const setRealEstateListings = (listings: ApiRealEstateListing[]) => {
    setAppState({ ...appState, listings: { listings } });
  };

  const putRealEstateListing = (listing: ApiRealEstateListing) => {
    const listings = [...realEstateListingsState.listings];
    const listingIndex = listings.map((l) => l.id).indexOf(listing.id);
    if (listingIndex !== -1) {
      listings[listingIndex] = listing;
    } else {
      listings.push(listing);
    }

    setRealEstateListings(listings);
  };

  return { realEstateListingsState, putRealEstateListing, setRealEstateListings };
};

export default useRealEstateListingState;
