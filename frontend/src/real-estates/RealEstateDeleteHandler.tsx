import { FormModalData } from "components/FormModal";
import { useHttp } from "hooks/http";
import React from "react";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext
} from "../context/RealEstateContext";
import { toastSuccess } from "../shared/shared.functions";

export interface RealEstateDeleteHandlerProps extends FormModalData {
  realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateDeleteHandler: React.FunctionComponent<RealEstateDeleteHandlerProps> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  realEstate
}) => {
  const { deleteRequest } = useHttp();
  const { realEstateDispatch } = React.useContext(RealEstateContext);

  const onSubmit = async (event: any) => {
    event.preventDefault();

    try {
      beforeSubmit();
      if (!!realEstate.id) {
        await deleteRequest(`/api/real-estate-listing/${realEstate.id}`);
        realEstateDispatch({
          type: RealEstateActionTypes.DELETE_REAL_ESTATE,
          payload: realEstate
        });
      }
      toastSuccess("Objekt erfolgreich gelöscht!");
      postSubmit(true);
    } catch (err) {
      console.log(err);
      postSubmit(false);
    }
  };

  return (
    <form id={formId} onSubmit={onSubmit}>
      Möchten Sie wirklich das Objekt löschen?
    </form>
  );
};
