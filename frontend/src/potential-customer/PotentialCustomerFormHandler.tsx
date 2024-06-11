import { FunctionComponent, useContext } from "react";
import { useHistory } from "react-router-dom";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import {
  PotentialCustomerActionTypes,
  PotentialCustomerContext,
} from "context/PotentialCustomerContext";
import {
  ApiPotentialCustomer,
  ApiPreferredLocation,
  ApiUpsertPotentialCustomer,
} from "../../../shared/types/potential-customer";
import PotentialCustomerForm from "./PotentialCustomerForm";
import { toastError, toastSuccess } from "shared/shared.functions";
import { usePotentialCustomerData } from "../hooks/potentialcustomerdata";

// TODO change to "plainToInstance" from the "class-transformer" package
export const mapFormToApiUpsertPotentialCustomer = (
  values: any
): ApiUpsertPotentialCustomer => {
  return {
    name: values.name,
    email: values.email,
    preferredAmenities: values.preferredAmenities,
    routingProfiles: values.routingProfiles,
    preferredLocations: values.preferredLocations?.filter(
      (pl: ApiPreferredLocation) => !!pl.title && !!pl.address
    ),
    realEstateCharacteristics: values.realEstateCharacteristics,
    realEstateCostStructure: values.realEstateCostStructure,
  };
};

interface IPotentialCustomerFormHandlerProps {
  customer: Partial<ApiPotentialCustomer>;
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

const PotentialCustomerFormHandler: FunctionComponent<
  IPotentialCustomerFormHandlerProps
> = ({ formId, beforeSubmit = () => {}, postSubmit = () => {}, customer }) => {
  const { t } = useTranslation();
  const { potentialCustomerDispatch } = useContext(PotentialCustomerContext);

  const history = useHistory();
  const { createPotentialCustomer, updatePotentialCustomer } =
    usePotentialCustomerData();

  const onSubmit = async (values: any): Promise<void> => {
    const mappedPotentialCustomer = mapFormToApiUpsertPotentialCustomer(values);

    try {
      beforeSubmit();

      const storedCustomer = customer.id
        ? await updatePotentialCustomer(customer.id, mappedPotentialCustomer)
        : await createPotentialCustomer(mappedPotentialCustomer);

      potentialCustomerDispatch({
        type: PotentialCustomerActionTypes.PUT_POTENTIAL_CUSTOMER,
        payload: storedCustomer,
      });

      postSubmit(true);
      toastSuccess(t(IntlKeys.potentialCustomers.potentialCustomerSubmitSuccessful));
      history.push(`/potential-customers?id=${storedCustomer.id}`);
    } catch (err) {
      console.error(err);
      toastError(t(IntlKeys.potentialCustomers.potentialCustomerSubmitFailed));
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
