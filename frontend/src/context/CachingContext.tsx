import { Dispatch, createContext, useReducer, FunctionComponent } from "react";

import {
  IExportFlowState,
  IQrCodeState,
  ISortableEntityGroup,
} from "../export/one-page/OnePageExportModal";
import {
  IApiOpenAiLocationRealEstateDescriptionQuery,
  IApiOpenAiQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IOpenAiLocationDescriptionFormValues,
} from "../../../shared/types/open-ai";
import { ISelectableMapClipping } from "../export/MapClippingSelection";

interface IOpenAiCachingState {
  locationDescription?: IOpenAiLocationDescriptionFormValues;
  realEstateDescription?: IApiOpenAiRealEstateDescriptionQuery;
  locationRealEstateDescription?: IApiOpenAiLocationRealEstateDescriptionQuery;
  query?: IApiOpenAiQuery;
}

interface IOnePageCachingState {
  snapshotId?: string;
  exportFlowState?: IExportFlowState;
  locationDescriptionParams?: IOpenAiLocationDescriptionFormValues;
  locationDescription?: string;
  filteredGroups?: ISortableEntityGroup[];
  isPng?: boolean;
  isTransparentBackground?: boolean;
  qrCodeState?: IQrCodeState;
  selectableMapClippings?: ISelectableMapClipping[];
}

interface ICachingState {
  openAi: IOpenAiCachingState;
  onePage: IOnePageCachingState;
}

export enum CachingActionTypesEnum {
  SET_OPEN_AI = "SET_OPEN_AI",
  SET_ONE_PAGE = "SET_ONE_PAGE",
}

type TCachingActionsPayload = {
  [CachingActionTypesEnum.SET_OPEN_AI]: IOpenAiCachingState;
  [CachingActionTypesEnum.SET_ONE_PAGE]: IOnePageCachingState;
};

type TCachingActions =
  ActionMap<TCachingActionsPayload>[keyof ActionMap<TCachingActionsPayload>];

export const initialState: ICachingState = {
  openAi: {},
  onePage: {},
};

const cachingReducer = (
  state: ICachingState,
  action: TCachingActions
): ICachingState => {
  switch (action.type) {
    case CachingActionTypesEnum.SET_OPEN_AI: {
      return { ...state, openAi: { ...state.openAi, ...action.payload } };
    }

    case CachingActionTypesEnum.SET_ONE_PAGE: {
      return {
        ...state,
        onePage:
          action.payload.snapshotId &&
          action.payload.snapshotId !== state.onePage.snapshotId
            ? { ...action.payload }
            : { ...state.onePage, ...action.payload },
      };
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
