import { FormModalData } from "components/FormModal";
import {
  RealEstateListingActions,
  RealEstateListingContext
} from "context/RealEstateListingContext";
import { useHttp } from "hooks/http";
import React from "react";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import {
  ApiFurnishing,
  ApiRealEstateListing,
  ApiUpsertRealEstateListing,
} from "../../../shared/types/real-estate";
import RealEstateListingForm from "./RealEstateListingForm";

const mapFormToApiUpsertRealEstateListing = async (
  values: any
): Promise<ApiUpsertRealEstateListing> => {
  const availableFurnishing = Object.keys(ApiFurnishing);
  const furnishing = Object.entries(values)
    .filter(([k, v]) => Boolean(v))
    .filter(([k, v]) => availableFurnishing.includes(k))
    .map(([k, v]) => k) as ApiFurnishing[];

  const { lat, lng } = await deriveGeocodeByAddress(values.address);

  return {
    name: values.name,
    address: values.address,
    coordinates: {
      lat,
      lng,
    },
    costStructure: {
      price: {
        amount: values.price,
        currency: "€",
      },
      type: values.type,
    },
    characteristics: {
      numberOfRooms: values.numberOfRooms,
      propertySizeInSquareMeters: values.propertySizeInSquareMeters,
      realEstateSizeInSquareMeters: values.realEstateSizeInSquareMeters,
      energyEfficiency: values.energyEfficiency,
      furnishing,
    },
  };
};

export interface RealEstateListingFormHandlerData extends FormModalData {
  realEstateListing: Partial<ApiRealEstateListing>;
}

export const RealEstateListingFormHandler: React.FunctionComponent<RealEstateListingFormHandlerData> =
  ({
    formId,
    beforeSubmit = () => {},
    postSubmit = () => {},
    realEstateListing,
  }) => {
    const { post, put } = useHttp();
    const { realEstateDispatch } = React.useContext(
      RealEstateListingContext
    );;

    const onSubmit = async (values: any) => {
      const mappedRealEstateListing: ApiUpsertRealEstateListing =
        await mapFormToApiUpsertRealEstateListing(values);

      try {
        let listing = null;
        beforeSubmit();
        if (realEstateListing.id) {
          listing = await put(
            `/api/real-estate-listings/${realEstateListing.id}`,
            mappedRealEstateListing
          );
        } else {
          listing = await post(
            "/api/real-estate-listings",
            mappedRealEstateListing
          );
        }
        realEstateDispatch({
          type: RealEstateListingActions.PUT_REAL_ESTATE_LISTING,
          payload: listing.data as ApiRealEstateListing,
        });
        postSubmit(true);
      } catch (err) {
        console.log(err);
        postSubmit(false);
      }
    };

    return (
      <RealEstateListingForm
        formId={formId!}
        onSubmit={onSubmit}
        realEstateListing={realEstateListing}
      ></RealEstateListingForm>
    );
  };

export default RealEstateListingFormHandler;
