import React from "react";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";

export interface PotentialCustomerState {
    customers: ApiPotentialCustomer[];
  }
  
  export const initialState: PotentialCustomerState = {
    customers: [],
  };

  export enum PotentialCustomerActions {
    SET_POTENTIAL_CUSTOMERS = "SET_POTENTIAL_CUSTOMERS",
    PUT_POTENTIAL_CUSTOMER = "PUT_POTENTIAL_CUSTOMER",
    DELETE_POTENTIAL_CUSTOMER = "DELETE_POTENTIAL_CUSTOMER",
  }
  
  const reducer: (
    state: PotentialCustomerState,
    action: { type: PotentialCustomerActions; payload?: any }
  ) => PotentialCustomerState = (state, action) => {
    switch (action.type) {
      case PotentialCustomerActions.SET_POTENTIAL_CUSTOMERS: {
        return {...state, customers: action.payload};
      }
      case PotentialCustomerActions.PUT_POTENTIAL_CUSTOMER: {
          const customer = action.payload as ApiPotentialCustomer;
          const customers = [...state.customers];
          const customerIndex = customers.map((l) => l.id).indexOf(customer.id);
          if (customerIndex !== -1) {
            customers[customerIndex] = customer;
          } else {
            customers.push(customer);
          }
        return {...state, customers};
      }
      case PotentialCustomerActions.DELETE_POTENTIAL_CUSTOMER: {
        const customer = action.payload as ApiPotentialCustomer;
        const customers = [...state.customers].filter(c => c.id !== customer.id);
      return {...state, customers};
    }
      default:
        return state;
    }
  };
  
  export const PotentialCustomerContext = React.createContext<{
    potentialCustomerState: any;
    potentialCustomerDispatch: (action: {type: PotentialCustomerActions, payload?: any}) => void;
  }>({ potentialCustomerState: initialState, potentialCustomerDispatch: () => {} });
  
  export const PotentialCustomerContextProvider = ({
    children,
  }: {
    children: any;
  }) => {
    const [state, dispatch] = React.useReducer<any>(reducer, initialState);
  
    return (
      <PotentialCustomerContext.Provider
        value={{ potentialCustomerState: state, potentialCustomerDispatch: dispatch }}
      >
        {children}
      </PotentialCustomerContext.Provider>
    );
  };
  