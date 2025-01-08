import { FC, useContext, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { PotentialCustomerContext } from "context/PotentialCustomerContext";
import { SearchContext, SearchContextActionTypes } from "context/SearchContext";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import useOnClickOutside from "hooks/onclickoutside";
import { osmEntityTypes } from "../../../shared/constants/osm-entity-types";
import { useHistory } from "react-router-dom";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import { useUserState } from "../hooks/userstate";

interface IPotentialCustomerDropDownProps {
  buttonStyles?: string;
}

export const PotentialCustomerDropDown: FC<IPotentialCustomerDropDownProps> = ({
  buttonStyles = "btn btn-sm bg-white text-primary border-primary hover:bg-primary hover:text-white w-full sm:w-auto",
}) => {
  const { t } = useTranslation();
  const { potentialCustomerState } = useContext(PotentialCustomerContext);
  const { searchContextDispatch } = useContext(SearchContext);
  const { push: historyPush } = useHistory();
  const { getCurrentUser } = useUserState();

  const { isAdmin } = getCurrentUser();

  const fillDataFromCustomer = ({
    preferredAmenities,
    routingProfiles,
    preferredLocations,
  }: ApiPotentialCustomer) => {
    const localityParams = osmEntityTypes.filter((entity) =>
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

  if (!potentialCustomerState.customers?.length) {
    return null;
  }

  return (
    <div ref={dropDownRef} className="dropdown mt-5 w-full sm:w-auto">
      <div
        className={buttonStyles}
        tabIndex={0}
        onClick={() => setMenuOpen(!menuOpen)}
        data-tour="my-customers"
      >
        {t(IntlKeys.environmentalAnalysis.targetGroups)}
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

          {isAdmin && (
            <li key="customer-drop-down-new">
              <button
                type="button"
                onClick={() => {
                  historyPush("/potential-customers/new");
                }}
                className="btn btn-link whitespace-nowrap"
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold">
                    <img src={plusIcon} alt="pdf-icon" />{" "}
                    {t(IntlKeys.potentialCustomers.newTargetGroup)}
                  </span>
                </div>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default PotentialCustomerDropDown;
