import { Dispatch, createContext, useReducer, FunctionComponent } from "react";

export interface IOnOfficeContextState {
  userId?: string;
  parameterCacheId?: string;
}

export enum OnOfficeContextActionTypesEnum {
  SET_STATE = "SET_STATE",
}

type TOnOfficeContextActionsPayload = {
  [OnOfficeContextActionTypesEnum.SET_STATE]: IOnOfficeContextState;
};

export type TOnOfficeActions =
  ActionMap<TOnOfficeContextActionsPayload>[keyof ActionMap<TOnOfficeContextActionsPayload>];

export const initialState: IOnOfficeContextState = {};

const onOfficeReducer = (
  state: IOnOfficeContextState,
  action: TOnOfficeActions
): IOnOfficeContextState => {
  switch (action.type) {
    case OnOfficeContextActionTypesEnum.SET_STATE: {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
};

export const OnOfficeContext = createContext<{
  onOfficeContextState: IOnOfficeContextState;
  onOfficeContextDispatch: Dispatch<TOnOfficeActions>;
}>({
  onOfficeContextState: initialState,
  onOfficeContextDispatch: () => undefined,
});

export const OnOfficeContextProvider: FunctionComponent = ({ children }) => {
  const [state, dispatch] = useReducer(onOfficeReducer, initialState);

  return (
    <OnOfficeContext.Provider
      value={{ onOfficeContextState: state, onOfficeContextDispatch: dispatch }}
    >
      {children}
    </OnOfficeContext.Provider>
  );
};
