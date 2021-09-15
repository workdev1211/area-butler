import { RealEstateListingContext } from "context/RealEstateListingContext";
import React from "react";
import { useState } from "react";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";

export interface RealEstateMenuListData {
  fillAdressFromListing: (listing: ApiRealEstateListing) => void;
}

export const RealEstateMenuList: React.FunctionComponent<RealEstateMenuListData> =
  ({ fillAdressFromListing }) => {
    const { realEstateListingState } = React.useContext(
      RealEstateListingContext
    );

    const [showMenu, setShowMenu] = useState(false);

    const dropdownClasses = showMenu ? "dropdown dropdown-open" : "dropdown";

    return realEstateListingState.listings?.length > 0 ? (
      <div className={dropdownClasses}>
        <div className="m-1 btn btn-sm" onClick={() => setShowMenu(true)}>
          Meine Objekte
        </div>
        <ul className="p-2 shadow menu dropdown-content bg-base-100 rounded-box">
          {realEstateListingState.listings.map(
            (realEstateListing: ApiRealEstateListing) => (
              <li key={realEstateListing.id}>
                <a
                  onClick={(e) => {
                    fillAdressFromListing(realEstateListing);
                    setShowMenu(false);
                  }}
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
            )
          )}
        </ul>
      </div>
    ) : null;
  };

export default RealEstateMenuList;
