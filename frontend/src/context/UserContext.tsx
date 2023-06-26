import { FunctionComponent, createContext, useReducer, Dispatch } from "react";

import {
  ApiSearchResultSnapshotResponse,
  ApiUser,
  ApiUserRequests,
  IApiUserApiConnectionSettingsReq,
} from "../../../shared/types/types";
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  IApiIntegrationUser,
} from "../../../shared/types/integration-user";

export interface UserState {
  user?: ApiUser;
  latestUserRequests?: ApiUserRequests;
  upgradeSubscriptionModalProps: {
    open: boolean;
    message?: any;
  };
  startTour: boolean;
  embeddableMaps: ApiSearchResultSnapshotResponse[];
  integrationUser?: IApiIntegrationUser;
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
  INT_USER_DECR_AVAIL_PROD_CONT = "INT_USER_DECR_AVAIL_PROD_CONT",
  SET_LATEST_USER_REQUESTS = "SET_LATEST_USER_REQUESTS",
  SET_SUBSCRIPTION_MODAL_PROPS = "SET_SUBSCRIPTION_MODAL_PROPS",
  SET_EMBEDDABLE_MAPS = "SET_EMBEDDABLE_MAPS",
  SET_EMBEDDABLE_MAP_DESCRIPTION = "SET_EMBEDDABLE_MAP_DESCRIPTION",
  REMOVE_EMBEDDABLE_MAP = "REMOVE_EMBEDDABLE_MAP",
  SET_START_TOUR = "SET_START_TOUR",
  SET_LOGO = "SET_LOGO",
  SET_MAP_ICON = "SET_MAP_ICON",
  SET_COLOR = "SET_COLOR",
  SET_API_CONNECTION = "SET_API_CONNECTION",
}

type UserActionsPayload = {
  [UserActionTypes.SET_USER]: ApiUser;
  [UserActionTypes.SET_INTEGRATION_USER]: IApiIntegrationUser;
  [UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT]: ApiIntUserOnOfficeProdContTypesEnum;
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
  [UserActionTypes.SET_API_CONNECTION]: IApiUserApiConnectionSettingsReq;
};

export type UserActions =
  ActionMap<UserActionsPayload>[keyof ActionMap<UserActionsPayload>];

export const userReducer = (
  state: UserState,
  action: UserActions
): UserState => {
  switch (action.type) {
    case UserActionTypes.SET_USER: {
      return { ...state, user: { ...action.payload } };
    }
    case UserActionTypes.SET_INTEGRATION_USER: {
      return { ...state, integrationUser: { ...action.payload } };
    }
    case UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT: {
      if (!state.integrationUser?.availProdContingents) {
        return state;
      }

      const integrationUser = { ...state.integrationUser };

      if (!integrationUser.availProdContingents![action.payload]) {
        return state;
      }

      integrationUser.availProdContingents![action.payload]! -= 1;

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
    case UserActionTypes.SET_API_CONNECTION: {
      const { connectionType, ...connectionSettings } = action.payload;

      const user = {
        ...state.user!,
        apiConnections: {
          ...(state.user!.apiConnections || {}),
          [action.payload.connectionType]: { ...connectionSettings },
        },
      };

      return { ...state, user };
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
