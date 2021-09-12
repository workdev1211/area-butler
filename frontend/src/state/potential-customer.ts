import { useAppState } from "@laststance/use-app-state";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import { AppState } from "./app";

export interface PotentialCustomerState {
  customers: ApiPotentialCustomer[];
}

export const initialState: PotentialCustomerState = {
  customers: [],
};

export const usePotentialCustomerState = () => {
  const [appState, setAppState] = useAppState<AppState>();

  const potentialCustomersState = appState.potentialCustomers;

  const setPotentialCustomers = (customers: ApiPotentialCustomer[]) => {
    setAppState({ ...appState, potentialCustomers: { customers } });
  };

  const putPotentialCustomer = (customer: ApiPotentialCustomer) => {
    const customers = [...potentialCustomersState.customers];
    const listingIndex = customers.map((c) => c.id).indexOf(customer.id);
    if (listingIndex !== -1) {
      customers[listingIndex] = customer;
    } else {
      customers.push(customer);
    }

    setPotentialCustomers(customers);
  };

  return {
    potentialCustomersState,
    putPotentialCustomer,
    setPotentialCustomers,
  };
};

export default usePotentialCustomerState;
