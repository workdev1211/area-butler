import { FC, useContext } from "react";
import { useHistory } from "react-router-dom";

import { FormModalData } from "components/FormModal";
import {
  deriveGeocodeByAddress,
  processInputValue,
  toastError,
  toastSuccess,
} from "shared/shared.functions";
import {
  ApiFurnishing,
  IApiRealEstateListingSchema,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypeEnum,
  RealEstateContext,
} from "../context/RealEstateContext";
import RealEstateForm, { TRealEstResultValues } from "./RealEstateForm";
import { useRealEstateData } from "../hooks/realestatedata";
import { ApiUser } from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import { TInitRealEstate } from "../pages/RealEstatePage";

const mapFormDataToUpsertRealEstate = async (
  user: ApiUser | IApiIntegrationUser,
  values: TRealEstResultValues
): Promise<IApiRealEstateListingSchema> => {
  const availFurnishing = Object.keys(ApiFurnishing);

  const furnishing = Object.keys(values).filter(
    (key) =>
      availFurnishing.includes(key) && values[key as keyof TRealEstResultValues]
  ) as ApiFurnishing[];

  const { lat, lng } = await deriveGeocodeByAddress(user, values.address);

  const realEstate: IApiRealEstateListingSchema = {
    address: values.address,
    characteristics: {
      furnishing,
      energyEfficiency: values.energyEfficiency,
      propertySizeInSquareMeters: processInputValue(
        values.propertySizeInSquareMeters,
        "number"
      ),
      realEstateSizeInSquareMeters: processInputValue(
        values.realEstateSizeInSquareMeters,
        "number"
      ),
      startingAt: values.propertyStartingAt,
    },
    costStructure: undefined,
    externalUrl: processInputValue(values.externalUrl),
    location: {
      type: "Point",
      coordinates: [lat, lng],
    },
    name: values.name,
    showInSnippet: values.showInSnippet,
    status: processInputValue(values.status),
    status2: processInputValue(values.status2),
  };

  if (values.minPrice || values.price) {
    realEstate.costStructure = {
      type: values.type,
    };

    if (values.minPrice) {
      realEstate.costStructure.minPrice = {
        amount: values.minPrice,
        currency: "€",
      };
    }

    if (values.price) {
      realEstate.costStructure.price = {
        amount: values.price,
        currency: "€",
      };
    }
  }

  return realEstate;
};

interface IRealEstateFormHandlerProps extends FormModalData {
  realEstate: TInitRealEstate;
  user: ApiUser | IApiIntegrationUser;
}

export const RealEstateFormHandler: FC<IRealEstateFormHandlerProps> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  realEstate,
  user,
}) => {
  const { realEstateDispatch } = useContext(RealEstateContext);

  const history = useHistory();
  const { createRealEstate, updateRealEstate } = useRealEstateData();

  const onSubmit = async (values: TRealEstResultValues): Promise<void> => {
    const updatedRealEstData = await mapFormDataToUpsertRealEstate(
      user,
      values
    );

    try {
      beforeSubmit();

      const updatedRealEstate = realEstate.id
        ? await updateRealEstate(realEstate.id, updatedRealEstData)
        : await createRealEstate(updatedRealEstData);

      realEstateDispatch({
        type: RealEstateActionTypeEnum.PUT_REAL_ESTATE,
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
    <RealEstateForm
      formId={formId!}
      onSubmit={onSubmit}
      realEstate={realEstate}
    />
  );
};

export default RealEstateForm;
