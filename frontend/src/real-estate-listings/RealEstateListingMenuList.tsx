import useRealEstateListingState from "state/real-estate-listing";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface RealEstateMenuListData {
  fillAdressFromListing: (listing: ApiRealEstateListing) => void;
}

export const RealEstateMenuList: React.FunctionComponent<RealEstateMenuListData> =
  ({ fillAdressFromListing }) => {
    const { realEstateListingsState } = useRealEstateListingState();

    return (
      <div className="dropdown">
        <div tabIndex={0} className="m-1 btn btn-sm">
          Meine Objekte
        </div>
        <ul
          tabIndex={0}
          className="p-2 shadow menu dropdown-content bg-base-100 rounded-box"
        >
          {realEstateListingsState.listings.map((realEstateListing) => (
            <li key={realEstateListing.id}>
              <a
                onClick={() => fillAdressFromListing(realEstateListing)}
                className="whitespace-nowrap w-full"
              >
                <div className="flex flex-col items-start">
                  <span>{realEstateListing.name}</span>
                  <span className="text-gray-500 text-xs">
                    {realEstateListing.address}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

export default RealEstateMenuList;
