import { RefObject } from "react";
import { FormikProps } from "formik/dist/types";

export interface IPoiIcon {
  icon: string;
  color: string;
  isCustom?: boolean;
}

export type TFormikInnerRef<T> = RefObject<FormikProps<T>>;
