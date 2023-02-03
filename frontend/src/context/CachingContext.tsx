import { Dispatch, createContext, useReducer, FunctionComponent } from "react";

import { IOpenAiCachingState } from "../../../shared/types/caching";

export interface ICachingState {
  openAi: IOpenAiCachingState;
}

export enum CachingActionTypesEnum {
  SET_OPEN_AI = "SET_OPEN_AI",
}

type TCachingActionsPayload = {
  [CachingActionTypesEnum.SET_OPEN_AI]: IOpenAiCachingState;
};

export type TCachingActions =
  ActionMap<TCachingActionsPayload>[keyof ActionMap<TCachingActionsPayload>];

export const initialState: ICachingState = { openAi: {} };

const cachingReducer = (
  state: ICachingState,
  action: TCachingActions
): ICachingState => {
  switch (action.type) {
    case CachingActionTypesEnum.SET_OPEN_AI: {
      return { ...state, openAi: { ...state.openAi, ...action.payload } };
    }

    default:
      return state;
  }
};

export const CachingContext = createContext<{
  cachingState: ICachingState;
  cachingDispatch: Dispatch<TCachingActions>;
}>({
  cachingState: initialState,
  cachingDispatch: () => undefined,
});

export const CachingContextProvider: FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(cachingReducer, initialState);

  return (
    <CachingContext.Provider
      value={{ cachingState: state, cachingDispatch: dispatch }}
    >
      {children}
    </CachingContext.Provider>
  );
};
