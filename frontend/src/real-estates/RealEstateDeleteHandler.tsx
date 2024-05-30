import { FC, useContext } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { FormModalData } from "components/FormModal";
import { useHttp } from "hooks/http";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import {
  RealEstateActionTypeEnum,
  RealEstateContext,
} from "../context/RealEstateContext";
import { toastSuccess } from "../shared/shared.functions";

interface IRealEstateDeleteHandlerProps extends FormModalData {
  realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateDeleteHandler: FC<IRealEstateDeleteHandlerProps> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  realEstate,
}) => {
  const { t } = useTranslation();
  const { deleteRequest } = useHttp();
  const { realEstateDispatch } = useContext(RealEstateContext);

  const onSubmit = async (event: any) => {
    event.preventDefault();

    try {
      beforeSubmit();
      if (!!realEstate.id) {
        await deleteRequest(`/api/real-estate-listing/${realEstate.id}`);
        realEstateDispatch({
          type: RealEstateActionTypeEnum.DELETE_REAL_ESTATE,
          payload: realEstate,
        });
      }
      toastSuccess(t(IntlKeys.common.objectSuccessfullyDeleted));
      postSubmit(true);
    } catch (err) {
      console.error(err);
      postSubmit(false);
    }
  };

  return (
    <form id={formId} onSubmit={onSubmit}>
      {t(IntlKeys.common.objectDeleteConfirmation)}
    </form>
  );
};
