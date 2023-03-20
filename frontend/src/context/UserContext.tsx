import { FunctionComponent, createContext, useReducer, Dispatch } from "react";

import {
  ApiSearchResultSnapshotResponse,
  ApiUser,
  ApiUserRequests,
} from "../../../shared/types/types";
import {
  IApiIntegrationUser,
  IApiIntUserAvailProdContingents,
} from "../../../shared/types/integration-user";
import { TIntegrationActionTypes } from "../../../shared/types/integration";
import { getProdContTypeByActType } from "../../../shared/functions/integration.functions";

export type TIntegrationUser = IApiIntegrationUser &
  IApiIntUserAvailProdContingents;

export interface UserState {
  user?: ApiUser;
  latestUserRequests?: ApiUserRequests;
  upgradeSubscriptionModalProps: {
    open: boolean;
    message?: any;
  };
  startTour: boolean;
  embeddableMaps: ApiSearchResultSnapshotResponse[];
  integrationUser?: TIntegrationUser;
}

export const initialState: UserState = {
  user: undefined,
  latestUserRequests: { requests: [] },
  upgradeSubscriptionModalProps: {
    open: false,
    message: "",
  },
  startTour: false,
  embeddableMaps: [],
  integrationUser: undefined,
};

export enum UserActionTypes {
  SET_USER = "SET_USER",
  SET_INTEGRATION_USER = "SET_INTEGRATION_USER",
  DECR_AVAIL_PROD_CONT = "DECR_AVAIL_PROD_CONT",
  SET_LATEST_USER_REQUESTS = "SET_LATEST_USER_REQUESTS",
  SET_SUBSCRIPTION_MODAL_PROPS = "SET_SUBSCRIPTION_MODAL_PROPS",
  SET_EMBEDDABLE_MAPS = "SET_EMBEDDABLE_MAPS",
  SET_EMBEDDABLE_MAP_DESCRIPTION = "SET_EMBEDDABLE_MAP_DESCRIPTION",
  REMOVE_EMBEDDABLE_MAP = "REMOVE_EMBEDDABLE_MAP",
  SET_START_TOUR = "SET_START_TOUR",
  SET_LOGO = "SET_LOGO",
  SET_MAP_ICON = "SET_MAP_ICON",
  SET_COLOR = "SET_COLOR",
}

type UserActionsPayload = {
  [UserActionTypes.SET_USER]: ApiUser;
  [UserActionTypes.SET_INTEGRATION_USER]: TIntegrationUser;
  [UserActionTypes.DECR_AVAIL_PROD_CONT]: TIntegrationActionTypes;
  [UserActionTypes.SET_LATEST_USER_REQUESTS]: ApiUserRequests;
  [UserActionTypes.SET_EMBEDDABLE_MAPS]: ApiSearchResultSnapshotResponse[];
  [UserActionTypes.SET_EMBEDDABLE_MAP_DESCRIPTION]: {
    id: string;
    description: string;
  };
  [UserActionTypes.REMOVE_EMBEDDABLE_MAP]: string;
  [UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS]: {
    open: boolean;
    message: any;
  };
  [UserActionTypes.SET_START_TOUR]: boolean;
  [UserActionTypes.SET_LOGO]: string | undefined;
  [UserActionTypes.SET_MAP_ICON]: string | undefined;
  [UserActionTypes.SET_COLOR]: string | undefined;
};

export type UserActions =
  ActionMap<UserActionsPayload>[keyof ActionMap<UserActionsPayload>];

export const userReducer = (
  state: UserState,
  action: UserActions
): UserState => {
  switch (action.type) {
    case UserActionTypes.SET_USER: {
      return { ...state, user: action.payload };
    }
    case UserActionTypes.SET_INTEGRATION_USER: {
      return { ...state, integrationUser: { ...action.payload } };
    }
    case UserActionTypes.DECR_AVAIL_PROD_CONT: {
      if (!state.integrationUser) {
        return state;
      }

      const integrationUser = { ...state.integrationUser };

      const productContingentType = getProdContTypeByActType(
        integrationUser.integrationType,
        action.payload
      );

      if (!integrationUser.availProdContingents[productContingentType]) {
        return state;
      }

      integrationUser.availProdContingents[productContingentType]! -= 1;

      return { ...state, integrationUser };
    }
    case UserActionTypes.SET_LATEST_USER_REQUESTS: {
      return { ...state, latestUserRequests: action.payload };
    }
    case UserActionTypes.SET_EMBEDDABLE_MAPS: {
      return { ...state, embeddableMaps: action.payload };
    }
    case UserActionTypes.SET_EMBEDDABLE_MAP_DESCRIPTION: {
      return {
        ...state,
        embeddableMaps: [
          ...state.embeddableMaps.map((map) =>
            map.id !== action.payload.id
              ? map
              : { ...map, description: action.payload.description }
          ),
        ],
      };
    }
    case UserActionTypes.REMOVE_EMBEDDABLE_MAP: {
      return {
        ...state,
        embeddableMaps: [
          ...state.embeddableMaps.filter((map) => map.id !== action.payload),
        ],
      };
    }
    case UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS: {
      return { ...state, upgradeSubscriptionModalProps: action.payload };
    }
    case UserActionTypes.SET_START_TOUR: {
      return { ...state, startTour: action.payload };
    }
    case UserActionTypes.SET_LOGO: {
      return { ...state, user: { ...state.user!, logo: action.payload } };
    }
    case UserActionTypes.SET_MAP_ICON: {
      return { ...state, user: { ...state.user!, mapIcon: action.payload } };
    }
    case UserActionTypes.SET_COLOR: {
      return { ...state, user: { ...state.user!, color: action.payload } };
    }
    default:
      return state;
  }
};

export const UserContext = createContext<{
  userState: UserState;
  userDispatch: Dispatch<UserActions>;
}>({
  userState: initialState,
  userDispatch: () => undefined,
});

export const UserContextProvider: FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ userState: state, userDispatch: dispatch }}>
      {children}
    </UserContext.Provider>
  );
};
