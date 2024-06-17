import { RefObject } from "react";
import { FormikProps } from "formik/dist/types";
import { ResultStatusEnum } from "../../../shared/types/types";
import { OnOfficeLoginActionTypesEnum } from "../../../shared/types/on-office";

export interface IPoiIcon {
  icon: string;
  color: string;
  isCustom?: boolean;
}

export type TFormikInnerRef<T> = RefObject<FormikProps<T>>;

export interface IRealEstatesHistoryState {
  isFromRealEstates?: boolean;
}

export interface IPotentialCustomersHistoryState {
  isFromPotentialCustomers?: boolean;
}

export interface IMapPageHistoryState {
  isNewSnapshot?: boolean;
}

export interface ISearchParamsHistoryState
  extends IRealEstatesHistoryState,
    IPotentialCustomersHistoryState,
    IMapPageHistoryState {}

export interface IQueryParamsAndUrl<T = unknown> {
  queryParams: T;
  url: string;
}

export interface ILoginStatus {
  requestStatus: ResultStatusEnum;
  message?: string;
}

export interface IOnOfficeLoginStatus extends ILoginStatus {
  actionType?: OnOfficeLoginActionTypesEnum;
}
