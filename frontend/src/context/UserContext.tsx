import React from "react";
import { ApiUser, ApiUserRequests } from "../../../shared/types/types";

export interface UserState {
  user?: ApiUser;
  latestUserRequests?: ApiUserRequests;
  upgradeSubscriptionModalProps: {
    open: boolean,
    message?: string
  }
  startTour: boolean;
}

export const initialState: UserState = {
  user: undefined,
  latestUserRequests: {requests: []},
  upgradeSubscriptionModalProps: {
    open: false,
    message: ''
  },
  startTour: false
};

export enum UserActions {
  SET_USER = "SET_USER",
  SET_LATEST_USER_REQUESTS = "SET_LATEST_USER_REQUESTS",
  SET_SUBSCRIPTION_MODAL_PROPS = "SET_SUBSCRIPTION_MODAL_PROPS",
  SET_START_TOUR = "SET_START_TOUR",
  SET_LOGO = "SET_LOGO",
  SET_COLOR = "SET_COLOR",
}

const reducer: (
  state: UserState,
  action: { type: UserActions; payload?: any }
) => UserState = (state, action) => {
  switch (action.type) {
    case UserActions.SET_USER: {
      return { ...state, user: action.payload };
    }
    case UserActions.SET_LATEST_USER_REQUESTS: {
      return { ...state, latestUserRequests: action.payload };
    }
    case UserActions.SET_SUBSCRIPTION_MODAL_PROPS: {
      return { ...state, upgradeSubscriptionModalProps: action.payload };
    }
    case UserActions.SET_START_TOUR: {
      return { ...state, startTour: action.payload };
    }
    case UserActions.SET_LOGO: {
      return { ...state, user: { ...state.user, logo: action.payload }};
    }
    case UserActions.SET_COLOR: {
      return { ...state, user: { ...state.user, color: action.payload }};
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
