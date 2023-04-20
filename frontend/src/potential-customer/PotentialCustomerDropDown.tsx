import { FunctionComponent, useContext, useRef, useState } from "react";

import { PotentialCustomerContext } from "context/PotentialCustomerContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import useOnClickOutside from "hooks/onclickoutside";
import { getCombinedOsmEntityTypes } from "../../../shared/functions/shared.functions";

export interface PotentialCustomerDropDownProps {
  buttonStyles?: string;
}

export const PotentialCustomerDropDown: FunctionComponent<
  PotentialCustomerDropDownProps
> = ({
  buttonStyles = "btn btn-sm bg-white text-primary border-primary hover:bg-primary hover:text-white w-full sm:w-auto",
}) => {
  const { potentialCustomerState } = useContext(PotentialCustomerContext);
  const { searchContextDispatch } = useContext(SearchContext);

  const fillDataFromCustomer = ({
    preferredAmenities,
    routingProfiles,
    preferredLocations,
  }: ApiPotentialCustomer) => {
    const localityParams = getCombinedOsmEntityTypes().filter((entity) =>
      preferredAmenities?.includes(entity.name)
    );

    searchContextDispatch({
      type: SearchContextActionTypes.SET_LOCALITY_PARAMS,
      payload: localityParams,
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_TRANSPORTATION_PARAMS,
      payload: routingProfiles || [],
    });

    searchContextDispatch({
      type: SearchContextActionTypes.SET_PREFERRED_LOCATIONS,
      payload: preferredLocations || [],
    });
  };

  const dropDownRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useOnClickOutside(dropDownRef, () => menuOpen && setMenuOpen(false));

  const dropDownListStyle = menuOpen
    ? "p-2 shadow menu menu-open dropdown-content bg-base-100 rounded-box overflow-y-scroll"
    : "p-2 shadow menu dropdown-content bg-base-100 rounded-box overflow-y-scroll";

  return potentialCustomerState.customers?.length > 0 ? (
    <div ref={dropDownRef} className="dropdown mt-5 w-full sm:w-auto">
      <div
        className={buttonStyles}
        tabIndex={0}
        onClick={() => setMenuOpen(!menuOpen)}
        data-tour="my-customers"
      >
        Meine Zielgruppen
      </div>
      {menuOpen && (
        <ul tabIndex={0} className={dropDownListStyle}>
          {potentialCustomerState.customers.map(
            (customer: ApiPotentialCustomer) => (
              <li key={`customer-drop-down-${customer.id}`}>
                <button
                  type="button"
                  onClick={() => {
                    fillDataFromCustomer(customer);
                    setMenuOpen(false);
                  }}
                  className="btn btn-link whitespace-nowrap"
                  key={`customer-drop-down-a-${customer.id}`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold">
                      {customer.name}
                      {customer.email ? ` (${customer.email})` : ""}
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

export default PotentialCustomerDropDown;
