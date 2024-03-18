import { FunctionComponent, useContext } from "react";
import { useHistory } from "react-router-dom";

import { FormModalData } from "components/FormModal";
import {
  deriveGeocodeByAddress,
  toastError,
  toastSuccess,
} from "shared/shared.functions";
import {
  ApiFurnishing,
  ApiRealEstateListing,
  IApiRealEstateListingSchema,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import RealEstateForm from "./RealEstateForm";
import { useRealEstateData } from "../hooks/realestatedata";
import { ApiUser } from "../../../shared/types/types";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";

const mapFormToApiUpsertRealEstateListing = async (
  user: ApiUser | IApiIntegrationUser,
  values: any
): Promise<IApiRealEstateListingSchema> => {
  const availableFurnishing = Object.keys(ApiFurnishing);

  const furnishing = Object.keys(values).reduce<ApiFurnishing[]>(
    (result, key) => {
      if (availableFurnishing.includes(key) && values[key]) {
        result.push(key as ApiFurnishing);
      }

      return result;
    },
    []
  );

  const { lat, lng } = await deriveGeocodeByAddress(user, values.address);

  return {
    name: values.name,
    address: values.address,
    externalUrl: values.externalUrl,
    location: {
      type: "Point",
      coordinates: [lat, lng],
    },
    showInSnippet: values.showInSnippet,
    costStructure: {
      minPrice: Number.isFinite(values.minPrice)
        ? {
            amount: values.minPrice,
            currency: "€",
          }
        : undefined,
      price: Number.isFinite(values.price)
        ? {
            amount: values.price,
            currency: "€",
          }
        : undefined,
      type: values.type,
    },
    characteristics: {
      furnishing,
      startingAt: values.propertyStartingAt,
      numberOfRooms: values.numberOfRooms,
      propertySizeInSquareMeters: Number.isFinite(
        values.propertySizeInSquareMeters
      )
        ? values.propertySizeInSquareMeters
        : undefined,
      realEstateSizeInSquareMeters: Number.isFinite(
        values.realEstateSizeInSquareMeters
      )
        ? values.realEstateSizeInSquareMeters
        : undefined,
      energyEfficiency: values.energyEfficiency,
    },
    status: values.status,
    status2: values.status2,
  };
};

const validateBeforeSubmit = (values: any): boolean => {
  if (!values.address) {
    toastError("Bitte geben Sie die Immobilien-Adresse an");
    return false;
  }

  if (!Number.isFinite(values.minPrice) && !Number.isFinite(values.price)) {
    toastError("Bitte geben Sie entweder Mindest- oder Höchstpreise an");
    return false;
  }

  return true;
};

interface IRealEstateFormHandlerProps extends FormModalData {
  realEstate: Partial<ApiRealEstateListing>;
  user: ApiUser | IApiIntegrationUser;
}

export const RealEstateFormHandler: FunctionComponent<
  IRealEstateFormHandlerProps
> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  realEstate,
  user,
}) => {
  const { realEstateDispatch } = useContext(RealEstateContext);

  const history = useHistory();
  const { createRealEstate, updateRealEstate } = useRealEstateData();

  const onSubmit = async (values: any): Promise<void> => {
    const isValidated = validateBeforeSubmit(values);

    if (!isValidated) {
      postSubmit(false);
      return;
    }

    const updatedRealEstateData = await mapFormToApiUpsertRealEstateListing(
      user,
      values
    );

    try {
      beforeSubmit();

      const updatedRealEstate = realEstate.id
        ? await updateRealEstate(realEstate.id, updatedRealEstateData)
        : await createRealEstate(updatedRealEstateData);

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
    <RealEstateForm
      formId={formId!}
      onSubmit={onSubmit}
      realEstate={realEstate}
    />
  );
};

export default RealEstateForm;
