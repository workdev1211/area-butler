import { FunctionComponent, useContext, useRef, useState } from "react";

import { RealEstateContext } from "context/RealEstateContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import useOnClickOutside from "../hooks/onclickoutside";

export interface RealEstateMenuListProps {
  buttonStyles?: string;
}

const RealEstateDropDown: FunctionComponent<RealEstateMenuListProps> = ({
  buttonStyles = "btn btn-sm bg-white text-primary border-primary hover:bg-primary hover:text-white w-full sm:w-auto",
}) => {
  const { realEstateState } = useContext(RealEstateContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const fillAddressFromListing = async (listing: ApiRealEstateListing) => {
    const result = await deriveGeocodeByAddress(listing.address);
    const { lat, lng } = result;
    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: listing.address, value: { place_id: "123" } },
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: listing,
    });
    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: {
        lat,
        lng,
      },
    });
  };

  const dropDownRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  useOnClickOutside(dropDownRef, () => showMenu && setShowMenu(false));

  const dropdownClasses = showMenu
    ? "dropdown dropdown-open dropdown-top z-2000 relative mt-4 w-full sm:w-auto"
    : "dropdown mt-4 w-full sm:w-auto";

  return realEstateState.listings?.length > 0 ? (
    <div className={dropdownClasses} ref={dropDownRef}>
      <div
        className={buttonStyles}
        onClick={() => setShowMenu(!showMenu)}
        data-tour="my-real-estates"
      >
        Meine Immobilien
      </div>
      {showMenu && (
        <ul className="p-2 shadow menu menu-open dropdown-content bg-base-100 rounded-box overflow-y-scroll h-48">
          {realEstateState.listings.map(
            (realEstateListing: ApiRealEstateListing) => (
              <li key={`real-estate-listing-item-${realEstateListing.id}`}>
                <button
                  type="button"
                  key={`real-estate-listing-item-a-${realEstateListing.id}`}
                  onClick={() => {
                    fillAddressFromListing(realEstateListing);
                    setShowMenu(false);
                  }}
                  className="btn btn-link whitespace-nowrap w-full"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold">{realEstateListing.name}</span>
                    <span className="text-gray-500 text-xs">
                      {realEstateListing.address}
                    </span>
                  </div>
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  ) : null;
};

export default RealEstateDropDown;
