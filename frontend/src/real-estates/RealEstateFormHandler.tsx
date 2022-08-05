import { FunctionComponent, useContext } from "react";
import { useHistory } from "react-router-dom";

import { FormModalData } from "components/FormModal";
import { useHttp } from "hooks/http";
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
    coordinates: {
      lat,
      lng,
    },
    showInSnippet: values.showInSnippet,
    costStructure: {
      minPrice: values.minPrice
        ? {
            amount: values.minPrice,
            currency: "€",
          }
        : undefined,
      maxPrice: values.maxPrice
        ? {
            amount: values.maxPrice,
            currency: "€",
          }
        : undefined,
      type: values.type,
    },
    characteristics: {
      startingAt: values.propertyStartingAt,
      numberOfRooms: values.numberOfRooms,
      propertySizeInSquareMeters: values.propertySizeInSquareMeters,
      realEstateSizeInSquareMeters: values.realEstateSizeInSquareMeters,
      energyEfficiency: values.energyEfficiency,
      furnishing,
    },
    status: values.status,
  };
};

const validateBeforeSubmit = (values: any): boolean => {
  if (!values.address) {
    toastError("Bitte geben Sie die Immobilien-Adresse an");
    return false;
  }

  if (!Number.isFinite(values.minPrice) && !Number.isFinite(values.maxPrice)) {
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
  const history = useHistory();
  const { post, put } = useHttp();
  const { realEstateDispatch } = useContext(RealEstateContext);

  const onSubmit = async (values: any) => {
    const isValidated = validateBeforeSubmit(values);

    if (!isValidated) {
      postSubmit(false);
      return;
    }

    const mappedRealEstateListing: ApiUpsertRealEstateListing =
      await mapFormToApiUpsertRealEstateListing(values);

    try {
      let response;
      beforeSubmit();

      if (realEstate.id) {
        response = await put(
          `/api/real-estate-listings/${realEstate.id}`,
          mappedRealEstateListing
        );
      } else {
        response = await post(
          "/api/real-estate-listings",
          mappedRealEstateListing
        );
      }

      const newRealEstate = response.data as ApiRealEstateListing;

      realEstateDispatch({
        type: RealEstateActionTypes.PUT_REAL_ESTATE,
        payload: newRealEstate,
      });

      postSubmit(true);
      toastSuccess("Objekt erfolgreich gespeichert!");
      history.push(`/real-estates?id=${newRealEstate.id}`);
    } catch (err) {
      toastError("Fehler beim Speichern des Objektes");
      console.log(err);
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
