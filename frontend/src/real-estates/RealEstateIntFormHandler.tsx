import { FunctionComponent, useContext } from "react";
import { useHistory } from "react-router-dom";

import { FormModalData } from "components/FormModal";
import { toastError, toastSuccess } from "shared/shared.functions";
import {
  ApiRealEstateListing,
  IApiRealEstateListingSchema,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import { useRealEstateData } from "../hooks/realestatedata";
import RealEstateIntForm from "./RealEstateIntForm";

interface IRealEstateIntFormHandlerProps extends FormModalData {
  realEstate: ApiRealEstateListing;
}

export const RealEstateIntFormHandler: FunctionComponent<
  IRealEstateIntFormHandlerProps
> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  realEstate,
}) => {
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
        type: RealEstateActionTypes.PUT_REAL_ESTATE,
        payload: updatedRealEstate,
      });

      postSubmit(true);
      toastSuccess("Objekt erfolgreich gespeichert!");
      history.push(`/real-estates?id=${updatedRealEstate.id}`);
    } catch (err) {
      toastError("Fehler beim Speichern des Objektes");
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
