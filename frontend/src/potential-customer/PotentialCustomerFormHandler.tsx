import { FormModalData } from "components/FormModal";
import {
  PotentialCustomerActions,
  PotentialCustomerContext
} from "context/PotentialCustomerContext";
import { useHttp } from "hooks/http";
import React from "react";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import {
  ApiPotentialCustomer,
  ApiUpsertPotentialCustomer
} from "../../../shared/types/potential-customer";
import PotentialCustomerForm from "./PotentialCustomerForm";

const mapFormToApiUpsertRealEstateListing = async (
  values: any
): Promise<ApiUpsertPotentialCustomer> => {
  const locationsWithCoords = [];
  for (const location of values.preferredLocations) {
    const { lat, lng } = await deriveGeocodeByAddress(location.address);
    locationsWithCoords.push({
      ...location,
      coordinates: { lat, lng },
    });
  }

  return {
    name: values.name,
    email: values.email,
    preferredAmenities: values.preferredAmenities,
    routingProfiles: values.routingProfiles,
    preferredLocations: locationsWithCoords,
  };
};

export interface PotentialCustomerFormHandlerData extends FormModalData {
  customer: Partial<ApiPotentialCustomer>;
}

export const PotentialCustomerFormHandler: React.FunctionComponent<PotentialCustomerFormHandlerData> =
  ({ formId, beforeSubmit = () => {}, postSubmit = () => {}, customer }) => {
    const { post, put } = useHttp();
    const { potentialCustomerDispatch } = React.useContext(
      PotentialCustomerContext
    );

    const onSubmit = async (values: any) => {
      const mappedPotentialCustomer: ApiUpsertPotentialCustomer =
        await mapFormToApiUpsertRealEstateListing(values);

      try {
        let storedCustomer = null;
        beforeSubmit();
        if (customer.id) {
          storedCustomer = await put(
            `/api/potential-customers/${customer.id}`,
            mappedPotentialCustomer
          );
        } else {
          storedCustomer = await post(
            "/api/potential-customers/",
            mappedPotentialCustomer
          );
        }
        potentialCustomerDispatch({
          type: PotentialCustomerActions.PUT_POTENTIAL_CUSTOMER,
          payload: storedCustomer.data as ApiPotentialCustomer,
        });
        postSubmit(true);
      } catch (err) {
        console.log(err);
        postSubmit(false);
      }
    };

    return (
      <PotentialCustomerForm
        formId={formId!}
        onSubmit={onSubmit}
        customer={customer}
      />
    );
  };
