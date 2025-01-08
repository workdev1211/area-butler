import { FC, useContext } from "react";
import { useHistory } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { FormModalData } from "components/FormModal";
import { toastError, toastSuccess } from "shared/shared.functions";
import {
  ApiRealEstateListing,
  IApiRealEstateListingSchema,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypeEnum,
  RealEstateContext,
} from "../context/RealEstateContext";
import { useRealEstateData } from "../hooks/realestatedata";
import RealEstateIntForm from "./RealEstateIntForm";

interface IRealEstateIntFormHandlerProps extends FormModalData {
  realEstate: ApiRealEstateListing;
}

export const RealEstateIntFormHandler: FC<IRealEstateIntFormHandlerProps> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  realEstate,
}) => {
  const { t } = useTranslation();
  const { realEstateDispatch } = useContext(RealEstateContext);

  const history = useHistory();
  const { updateRealEstate } = useRealEstateData();

  const onSubmit = async (
    updatedData: Partial<IApiRealEstateListingSchema>
  ): Promise<void> => {
    try {
      beforeSubmit();

      const updatedRealEstate = await updateRealEstate(
        realEstate.id,
        updatedData
      );

      realEstateDispatch({
        type: RealEstateActionTypeEnum.PUT_REAL_ESTATE,
        payload: updatedRealEstate,
      });

      postSubmit(true);
      toastSuccess(t(IntlKeys.realEstate.objectSavedSuccessfully));
      history.push(`/real-estates?id=${updatedRealEstate.id}`);
    } catch (err) {
      toastError(t(IntlKeys.realEstate.objectErrorWhileSaving));
      console.error(err);
      postSubmit(false);
    }
  };

  return (
    <RealEstateIntForm
      formId={formId!}
      onSubmit={onSubmit}
      realEstate={realEstate}
    />
  );
};

export default RealEstateIntFormHandler;
