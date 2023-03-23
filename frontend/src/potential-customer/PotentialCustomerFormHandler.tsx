import { FunctionComponent, useContext } from "react";
import { useHistory } from "react-router-dom";

import {
  PotentialCustomerActionTypes,
  PotentialCustomerContext,
} from "context/PotentialCustomerContext";
import { useHttp } from "hooks/http";
import {
  ApiPotentialCustomer,
  ApiPreferredLocation,
  ApiUpsertPotentialCustomer,
} from "../../../shared/types/potential-customer";
import PotentialCustomerForm from "./PotentialCustomerForm";
import { toastError, toastSuccess } from "shared/shared.functions";

// TODO change to "plainToInstance" from the "class-transformer" package without async
export const mapFormToApiUpsertPotentialCustomer = async (
  values: any
): Promise<ApiUpsertPotentialCustomer> => {
  return {
    name: values.name,
    email: values.email,
    preferredAmenities: values.preferredAmenities,
    routingProfiles: values.routingProfiles,
    preferredLocations: values.preferredLocations.filter(
      (pl: ApiPreferredLocation) => !!pl.title && !!pl.address
    ),
    realEstateCharacteristics: values.realEstateCharacteristics,
    realEstateCostStructure: values.realEstateCostStructure,
  };
};

export interface PotentialCustomerFormHandlerData {
  customer: Partial<ApiPotentialCustomer>;
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

const PotentialCustomerFormHandler: FunctionComponent<
  PotentialCustomerFormHandlerData
> = ({ formId, beforeSubmit = () => {}, postSubmit = () => {}, customer }) => {
  const { post, put } = useHttp();
  const history = useHistory();

  const { potentialCustomerDispatch } = useContext(PotentialCustomerContext);

  const onSubmit = async (values: any) => {
    const mappedPotentialCustomer: ApiUpsertPotentialCustomer =
      await mapFormToApiUpsertPotentialCustomer(values);

    try {
      let response = null;
      beforeSubmit();

      if (customer.id) {
        response = await put(
          `/api/potential-customers/${customer.id}`,
          mappedPotentialCustomer
        );
      } else {
        response = await post(
          "/api/potential-customers/",
          mappedPotentialCustomer
        );
      }

      const storedCustomer = response.data as ApiPotentialCustomer;

      potentialCustomerDispatch({
        type: PotentialCustomerActionTypes.PUT_POTENTIAL_CUSTOMER,
        payload: storedCustomer,
      });

      postSubmit(true);
      toastSuccess("Interessent erfolgreich gespeichert!");
      history.push(`/potential-customers?id=${storedCustomer.id}`);
    } catch (err) {
      console.error(err);
      toastError("Fehler beim Speichern eines Interessenten");
      postSubmit(false);
    }
  };

  return (
    <PotentialCustomerForm
      formId={formId!}
      onSubmit={onSubmit}
      inputCustomer={customer}
    />
  );
};

export default PotentialCustomerFormHandler;
