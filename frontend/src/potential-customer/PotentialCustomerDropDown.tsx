import { useState } from "react";
import usePotentialCustomerState from "state/potential-customer";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";

  export const PotentialCustomerDropDown: React.FunctionComponent =
    () => {
      const { potentialCustomersState } = usePotentialCustomerState();
  
      const [showMenu, setShowMenu] = useState(false);

      const fillDataFromCustomer = (customer: ApiPotentialCustomer) => {

      }
  
      const dropdownClasses = showMenu ? "dropdown dropdown-open" : "dropdown"
  
      return potentialCustomersState.customers?.length > 0 ? (
        <div className={dropdownClasses}>
          <div className="m-1 btn btn-sm" onClick={() => setShowMenu(true)}>
            Meine Interessenten
          </div>
          <ul
            className="p-2 shadow menu dropdown-content bg-base-100 rounded-box"
          >
            {potentialCustomersState.customers.map((customer) => (
              <li key={customer.id}>
                <a
                  onClick={(e) => {fillDataFromCustomer(customer); setShowMenu(false)}}
                  className="whitespace-nowrap w-full"
                >
                  <div className="flex flex-col items-start">
                    <span>{customer.name}</span>
                    <span className="text-gray-500 text-xs">
                      {customer.email}
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
  