import {
  PropstackFieldNameEnum,
  PropstackTextFieldTypeEnum,
} from "../types/propstack";

export const propstackFieldNameToType: Record<
  PropstackFieldNameEnum,
  PropstackTextFieldTypeEnum
> = {
  [PropstackFieldNameEnum.DESCRIPTION_NOTE]:
    PropstackTextFieldTypeEnum.DESCRIPTION_NOTE,
  [PropstackFieldNameEnum.LOCATION_NOTE]:
    PropstackTextFieldTypeEnum.LOCATION_NOTE,
  [PropstackFieldNameEnum.OTHER_NOTE]: PropstackTextFieldTypeEnum.OTHER_NOTE,
};
