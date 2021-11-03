import React from "react";
import { ApiUser } from "../../../shared/types/types";

export interface UserState {
  user?: ApiUser;
  upgradeSubscriptionModalProps: {
    open: boolean,
    message?: string
  }
  startTour: boolean;
}

export const initialState: UserState = {
  user: undefined,
  upgradeSubscriptionModalProps: {
    open: false,
    message: ''
  },
  startTour: false
};

export enum UserActions {
  SET_USER = "SET_USER",
  SET_SUBSCRIPTION_MODAL_PROPS = "SET_SUBSCRIPTION_MODAL_PROPS",
  SET_START_TOUR = "SET_START_TOUR"
}

const reducer: (
  state: UserState,
  action: { type: UserActions; payload?: any }
) => UserState = (state, action) => {
  switch (action.type) {
    case UserActions.SET_USER: {
      return { ...state, user: action.payload };
    }
    case UserActions.SET_SUBSCRIPTION_MODAL_PROPS: {
      return { ...state, upgradeSubscriptionModalProps: action.payload };
    }
    case UserActions.SET_START_TOUR: {
      return { ...state, startTour: action.payload };
    }
    default:
      return state;
  }
};

export const UserContext = React.createContext<{
  userState: any;
  userDispatch: (action: { type: UserActions; payload?: any }) => void;
}>({ userState: initialState, userDispatch: () => {} });

export const UserContextProvider = ({ children }: { children: any }) => {
  const [state, dispatch] = React.useReducer<any>(reducer, initialState);

  return (
    <UserContext.Provider value={{ userState: state, userDispatch: dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
