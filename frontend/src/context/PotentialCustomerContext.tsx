import React, { Dispatch } from "react";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";

export interface PotentialCustomerState {
  customers: ApiPotentialCustomer[];
}

export const initialState: PotentialCustomerState = {
  customers: []
};

export enum PotentialCustomerActionTypes {
  SET_POTENTIAL_CUSTOMERS = "SET_POTENTIAL_CUSTOMERS",
  PUT_POTENTIAL_CUSTOMER = "PUT_POTENTIAL_CUSTOMER",
  DELETE_POTENTIAL_CUSTOMER = "DELETE_POTENTIAL_CUSTOMER"
}

type PotentialCustomerPayload = {
  [PotentialCustomerActionTypes.SET_POTENTIAL_CUSTOMERS]: ApiPotentialCustomer[];
  [PotentialCustomerActionTypes.PUT_POTENTIAL_CUSTOMER]: ApiPotentialCustomer;
  [PotentialCustomerActionTypes.DELETE_POTENTIAL_CUSTOMER]: Partial<
    ApiPotentialCustomer
  >;
};

export type PotentialCustomerActions = ActionMap<
  PotentialCustomerPayload
>[keyof ActionMap<PotentialCustomerPayload>];

export const potentialCustomerReducer = (
  state: PotentialCustomerState,
  action: PotentialCustomerActions
): PotentialCustomerState => {
  switch (action.type) {
    case PotentialCustomerActionTypes.SET_POTENTIAL_CUSTOMERS: {
      return { ...state, customers: [...action.payload] };
    }
    case PotentialCustomerActionTypes.PUT_POTENTIAL_CUSTOMER: {
      const customer = action.payload as ApiPotentialCustomer;
      const customers = [...state.customers];
      const customerIndex = customers.map(l => l.id).indexOf(customer.id);
      if (customerIndex !== -1) {
        customers[customerIndex] = customer;
      } else {
        customers.push(customer);
      }
      return { ...state, customers };
    }
    case PotentialCustomerActionTypes.DELETE_POTENTIAL_CUSTOMER: {
      const customer = action.payload as ApiPotentialCustomer;
      const customers = [...state.customers].filter(c => c.id !== customer.id);
      return { ...state, customers };
    }
    default:
      return state;
  }
};

export const PotentialCustomerContext = React.createContext<{
  potentialCustomerState: PotentialCustomerState;
  potentialCustomerDispatch: Dispatch<PotentialCustomerActions>;
}>({
  potentialCustomerState: initialState,
  potentialCustomerDispatch: () => undefined
});

export const PotentialCustomerContextProvider: React.FunctionComponent = ({
  children
}) => {
  const [state, dispatch] = React.useReducer(
    potentialCustomerReducer,
    initialState
  );

  return (
    <PotentialCustomerContext.Provider
      value={{
        potentialCustomerState: state,
        potentialCustomerDispatch: dispatch
      }}
    >
      {children}
    </PotentialCustomerContext.Provider>
  );
};
