import React from "react";
import { ApiUser } from "../../../shared/types/types";

export interface UserState {
  user?: ApiUser;
}

export const initialState: UserState = {
  user: undefined,
};

export enum UserActions {
  SET_USER = "SET_USER",
}

const reducer: (
  state: UserState,
  action: { type: UserActions; payload?: any }
) => UserState = (state, action) => {
  switch (action.type) {
    case UserActions.SET_USER: {
      return { ...state, user: action.payload };
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
