import { PotentialCustomerContext } from "context/PotentialCustomerContext";
import { SearchContext, SearchContextActions } from "context/SearchContext";
import React from "react";
import { useState } from "react";
import { meansOfTransportations, unitsOfTransportation } from "../../../shared/constants/constants";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";

  export const PotentialCustomerDropDown: React.FunctionComponent =
    () => {
      const { potentialCustomerState } = React.useContext(PotentialCustomerContext);
      const { searchContextDispatch } = React.useContext(SearchContext);
  
      const [showMenu, setShowMenu] = useState(false);

      const fillDataFromCustomer = (customer: ApiPotentialCustomer) => {
        searchContextDispatch({type: SearchContextActions.SET_LOCALITY_OPTIONS, payload: customer.preferredAmenities});
        searchContextDispatch({type: SearchContextActions.SET_TRANSPORTATION_PARAMS, payload: customer.routingProfiles});
        searchContextDispatch({type: SearchContextActions.SET_PREFERRED_LOCATIONS, payload: customer.preferredLocations});
      }
  
      const dropdownClasses = showMenu ? "dropdown dropdown-open" : "dropdown"
  
      return potentialCustomerState.customers?.length > 0 ? (
        <div className={dropdownClasses}>
          <div className="m-1 btn btn-sm" onClick={() => setShowMenu(true)}>
            Meine Interessenten
          </div>
          <ul
            className="p-2 shadow menu dropdown-content bg-base-100 rounded-box"
          >
            {potentialCustomerState.customers.map((customer: ApiPotentialCustomer) => (
              <li key={'customer-drop-down-' + customer.id}>
                <a
                  onClick={(e) => {fillDataFromCustomer(customer); setShowMenu(false)}}
                  className="whitespace-nowrap w-full"
                  key={'customer-drop-down-a-' + customer.id}
                >
                  <div className="flex flex-col items-start">
                    <span>{customer.name}</span>
                    <span className="text-gray-500 text-xs">
                      {customer.email}
                      
                      {(customer.routingProfiles ?? []).map((routingProfile) => (
                    <span key={'customer-drop-down-' + customer.id + "-routing-profile-" + routingProfile.type}>
                      <br />
                      <span>
                        {
                          meansOfTransportations.find(
                            (means) => means.type === routingProfile.type
                          )?.label
                        }{" "}
                        ({routingProfile.amount}{" "}
                        {
                          unitsOfTransportation.find(
                            (unit) => unit.type === routingProfile.unit
                          )?.label
                        }
                        )
                      </span>
                      <br />
                    </span>
                  ))}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null;
    };
  
  export default PotentialCustomerDropDown;
  