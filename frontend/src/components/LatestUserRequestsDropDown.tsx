import { FC, useContext, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { RealEstateContext } from "context/RealEstateContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { UserContext } from "context/UserContext";
import useOnClickOutside from "hooks/onclickoutside";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { ApiOsmEntity, ApiSearch } from "../../../shared/types/types";
import { osmEntityTypes } from "../../../shared/constants/osm-entity-types";

const LatestUserRequestsDropDown: FC = () => {
  const dropDownRef = useRef(null);

  const { userState } = useContext(UserContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { realEstateState } = useContext(RealEstateContext);

  const [showMenu, setShowMenu] = useState(false);

  const { t } = useTranslation();
  useOnClickOutside(dropDownRef, () => showMenu && setShowMenu(false));

  const requests = userState.latestUserRequests?.requests || [];

  const buttonStyles =
    "btn btn-sm bg-white text-primary border-primary hover:bg-primary hover:text-white w-full sm:w-auto";

  const dropdownClasses = showMenu
    ? "dropdown dropdown-open dropdown-top z-2000 relative mt-4 w-full sm:w-auto"
    : "dropdown mt-4 w-full sm:w-auto";

  const fillSearchParamsFromLatestRequest = (request: ApiSearch) => {
    const { lat, lng } = request.coordinates;

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PLACES_LOCATION,
      payload: { label: request.searchTitle!, value: { place_id: "123" } },
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCATION,
      payload: {
        lat,
        lng,
      },
    });

    const listings: ApiRealEstateListing[] = realEstateState.listings;

    const existingListing = listings.find(
      (l) =>
        JSON.stringify(l.coordinates) === JSON.stringify(request.coordinates)
    );

    if (existingListing) {
      searchContextDispatch({
        type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
        payload: existingListing,
      });
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: request.meansOfTransportation,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: request.preferredLocations || [],
    });

    const localityParams = request.preferredAmenities.reduce<ApiOsmEntity[]>(
      (result, osmName) => {
        const osmEntity = osmEntityTypes.find(
          (entity) => entity.name === osmName
        );

        if (osmEntity) {
          result.push(osmEntity);
        }

        return result;
      },
      []
    );

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
      payload: localityParams,
    });
  };

  return requests?.length > 0 ? (
    <div className={dropdownClasses} ref={dropDownRef}>
      <div
        className={buttonStyles}
        onClick={() => setShowMenu(!showMenu)}
        data-tour="last-requests"
      >
        {t(IntlKeys.environmentalAnalysis.lastEntries)}
      </div>
      {showMenu && (
        <ul className="p-2 shadow menu menu-open dropdown-content bg-base-100 rounded-box overflow-y-scroll h-48">
          {requests.map((request: ApiSearch) => (
            <li
              key={
                "latest-user-request-" +
                request.coordinates.lat +
                request.coordinates.lng
              }
            >
              <button
                type="button"
                key={
                  "latest-user-request-item" +
                  request.coordinates.lat +
                  request.coordinates.lng
                }
                onClick={() => {
                  fillSearchParamsFromLatestRequest(request);
                  setShowMenu(false);
                }}
                className="btn btn-link whitespace-nowrap w-full"
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">{request.searchTitle!}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : null;
};

export default LatestUserRequestsDropDown;
