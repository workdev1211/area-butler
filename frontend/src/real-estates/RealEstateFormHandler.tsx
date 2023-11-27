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
  ApiUpsertRealEstateListing,
} from "../../../shared/types/real-estate";
import {
  RealEstateActionTypes,
  RealEstateContext,
} from "../context/RealEstateContext";
import RealEstateForm from "./RealEstateForm";
import { useRealEstateData } from "../hooks/realestatedata";

const mapFormToApiUpsertRealEstateListing = async (
  values: any
): Promise<ApiUpsertRealEstateListing> => {
  const availableFurnishing = Object.keys(ApiFurnishing);

  // TODO convert to reduce
  const furnishing = Object.entries(values)
    .filter(([_, v]) => Boolean(v))
    .filter(([k, _]) => availableFurnishing.includes(k))
    .map(([k, _]) => k) as ApiFurnishing[];

  const { lat, lng } = await deriveGeocodeByAddress(values.address);

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
      furnishing,
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

export interface RealEstateFormHandlerProps extends FormModalData {
  realEstate: Partial<ApiRealEstateListing>;
}

export const RealEstateFormHandler: FunctionComponent<
  RealEstateFormHandlerProps
> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  realEstate,
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
