import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";

import DefaultLayout from "../layout/defaultLayout";
import {
  PotentialCustomerActionTypes,
  PotentialCustomerContext,
} from "../context/PotentialCustomerContext";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import PotentialCustomerFormHandler from "../potential-customer/PotentialCustomerFormHandler";
import BackButton from "../layout/BackButton";
import { localStorageSearchContext } from "../../../shared/constants/constants";
import { SearchContextState } from "context/SearchContext";
import { usePotentialCustomerData } from "../hooks/potentialcustomerdata";

export interface PotentialCustomerPageRouterProps {
  customerId: string;
}

const defaultCustomer: Partial<ApiPotentialCustomer> = {
  name: "Neue Zielgruppe",
  preferredLocations: [],
  routingProfiles: [],
};

const PotentialCustomerPage: FunctionComponent = () => {
  const { potentialCustomerState, potentialCustomerDispatch } = useContext(
    PotentialCustomerContext
  );
  const searchContextFromLocalStorageString = window.localStorage.getItem(
    localStorageSearchContext
  );

  const { customerId } = useParams<PotentialCustomerPageRouterProps>();
  const isNewCustomer = customerId === "new" || customerId === "from-result";
  let initialCustomer = { ...defaultCustomer };

  if (customerId === "from-result" && searchContextFromLocalStorageString) {
    const searchContextFromLocalStorage = JSON.parse(
      searchContextFromLocalStorageString!
    ) as SearchContextState;

    initialCustomer = {
      ...initialCustomer,
      preferredLocations: searchContextFromLocalStorage.preferredLocations,
      routingProfiles: searchContextFromLocalStorage.transportationParams,
      preferredAmenities: searchContextFromLocalStorage.localityParams.map(
        (l) => l.name
      ),
    };
  }

  const { fetchPotentialCustomers } = usePotentialCustomerData();

  const [customer, setCustomer] =
    useState<Partial<ApiPotentialCustomer>>(initialCustomer);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const getPotentialCustomers = async () => {
      const potentialCustomers = await fetchPotentialCustomers();

      potentialCustomerDispatch({
        type: PotentialCustomerActionTypes.SET_POTENTIAL_CUSTOMERS,
        payload: potentialCustomers,
      });
    };

    if (!potentialCustomerState.customers) {
      void getPotentialCustomers();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isNewCustomer) {
      setCustomer(initialCustomer);
      return;
    }

    setCustomer(
      potentialCustomerState.customers.find(
        (c: ApiPotentialCustomer) => c.id === customerId
      ) ?? initialCustomer
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [potentialCustomerState.customers, isNewCustomer, customerId]);

  const formId = `form-${uuid()}`;
  const beforeSubmit = () => setBusy(true);
  const postSubmit = () => {
    setBusy(false);
  };

  const baseClasses = "btn bg-primary-gradient w-full sm:w-auto";

  const SubmitButton: FunctionComponent = () => {
    const classes = `${baseClasses} ml-auto`;

    return (
      <button
        form={formId}
        key="submit"
        type="submit"
        disabled={busy}
        className={`${busy ? "busy " : ""}${classes}`}
      >
        {customer.id ? "Speichern" : "Anlegen"}
      </button>
    );
  };

  return (
    <DefaultLayout
      title={customer.name || "Unbekannter Name"}
      withHorizontalPadding={true}
      actionsBottom={[
        <BackButton to="/potential-customers" key="customer-back" />,
        <SubmitButton key="customer-submit" />,
      ]}
    >
      <div className="py-20">
        <PotentialCustomerFormHandler
          customer={customer}
          formId={formId}
          beforeSubmit={beforeSubmit}
          postSubmit={postSubmit}
        />
      </div>
    </DefaultLayout>
  );
};

export default PotentialCustomerPage;
