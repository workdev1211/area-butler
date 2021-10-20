import { PotentialCustomerContext } from "context/PotentialCustomerContext";
import { SearchContext, SearchContextActions } from "context/SearchContext";
import React, { useRef, useState } from "react";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import { osmEntityTypes } from "../../../shared/constants/constants";
import useOnClickOutside from "hooks/onclickoutside";

export interface PotentialCustomerDropDownProps {
  buttonStyles?: string;
}

export const PotentialCustomerDropDown: React.FunctionComponent<PotentialCustomerDropDownProps> =
  ({ buttonStyles = "dropdown-btn btn btn-sm bg-primary-gradient" }) => {
    const { potentialCustomerState } = React.useContext(
      PotentialCustomerContext
    );
    const { searchContextDispatch } = React.useContext(SearchContext);

    const fillDataFromCustomer = (customer: ApiPotentialCustomer) => {
      const localityParams = osmEntityTypes.filter((entity) =>
        customer.preferredAmenities.includes(entity.name)
      );

      searchContextDispatch({
        type: SearchContextActions.SET_LOCALITY_PARAMS,
        payload: localityParams,
      });
      searchContextDispatch({
        type: SearchContextActions.SET_TRANSPORTATION_PARAMS,
        payload: customer.routingProfiles,
      });
      searchContextDispatch({
        type: SearchContextActions.SET_PREFERRED_LOCATIONS,
        payload: customer.preferredLocations,
      });
    };

    const dropDownRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useOnClickOutside(dropDownRef, () => menuOpen && setMenuOpen(false));

    const dropDownListStyle = menuOpen ? 
    "p-2 shadow menu menu-open dropdown-content bg-base-100 rounded-box overflow-y-scroll" : 
      "p-2 shadow menu dropdown-content bg-base-100 rounded-box overflow-y-scroll";

    return potentialCustomerState.customers?.length > 0 ? (
      <div ref={dropDownRef} className="dropdown z-2000">
        <div className={buttonStyles} tabIndex={0} onClick={(e) => setMenuOpen(!menuOpen)}>
          + Meine Interessenten
        </div>
        {menuOpen && (
          <ul tabIndex={0} className={dropDownListStyle}>
            {potentialCustomerState.customers.map(
              (customer: ApiPotentialCustomer) => (
                <li key={"customer-drop-down-" + customer.id}>
                  <a
                    onClick={(e) => {
                      fillDataFromCustomer(customer);
                      setMenuOpen(false);
                    }}
                    className="whitespace-nowrap"
                    key={"customer-drop-down-a-" + customer.id}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold">
                        {customer.name} ({customer.email})
                      </span>
                    </div>
                  </a>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    ) : null;
  };

export default PotentialCustomerDropDown;
