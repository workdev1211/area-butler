import {RealEstateContext} from "context/RealEstateContext";
import {SearchContext, SearchContextActions} from "context/SearchContext";
import React, {useRef, useState} from "react";
import {deriveGeocodeByAddress} from "shared/shared.functions";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import useOnClickOutside from "../hooks/onclickoutside";

export interface RealEstateMenuListProps {
    buttonStyles?: string;
}

const RealEstateDropDown: React.FunctionComponent<RealEstateMenuListProps> =
    ({buttonStyles = 'btn btn-sm bg-white text-primary border-primary hover:bg-primary hover:text-white'}) => {
        const {realEstateState} = React.useContext(RealEstateContext);
        const {searchContextDispatch} = React.useContext(SearchContext);

        const fillAddressFromListing = async (listing: ApiRealEstateListing) => {
            const result = await deriveGeocodeByAddress(listing.address);
            const {lat, lng} = result;
            searchContextDispatch({
                type: SearchContextActions.SET_PLACES_LOCATION,
                payload: {label: listing.address, value: {place_id: '123'}}
            })
            searchContextDispatch({
                type: SearchContextActions.SET_REAL_ESTATE_LISTING,
                payload: listing
            });
            searchContextDispatch({
                type: SearchContextActions.SET_LOCATION,
                payload: {
                    lat,
                    lng
                }
            })
        }

        const dropDownRef = useRef(null);
        const [showMenu, setShowMenu] = useState(false);
        useOnClickOutside(dropDownRef, () => showMenu && setShowMenu(false));

        const dropdownClasses = showMenu ? "dropdown dropdown-open dropdown-top z-2000 relative" : "dropdown";

        return realEstateState.listings?.length > 0 ? (
            <div className={dropdownClasses} ref={dropDownRef}>
                <div className={buttonStyles} onClick={() => setShowMenu(!showMenu)}>
                    + Meine Objekte
                </div>
                {showMenu && (<ul className="p-2 shadow menu menu-open dropdown-content bg-base-100 rounded-box overflow-y-scroll h-48">
                    {realEstateState.listings.map(
                        (realEstateListing: ApiRealEstateListing) => (
                            <li key={'real-estate-listing-item-' + realEstateListing.id}>
                                <button type="button"
                                    key={'real-estate-listing-item-a-' + realEstateListing.id}
                                    onClick={(e) => {
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
                </ul>)}
            </div>
        ) : null;
    };

export default RealEstateDropDown;
