import { FunctionComponent, useContext } from "react";

import { FormModalData } from "components/FormModal";
import {
  PotentialCustomerActionTypes,
  PotentialCustomerContext,
} from "context/PotentialCustomerContext";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import { toastSuccess } from "../shared/shared.functions";
import { usePotentialCustomerData } from "../hooks/potentialcustomerdata";
import { UserContext } from "../context/UserContext";

interface IPotentialCustomerFormDeleteHandlerProps extends FormModalData {
  potentialCustomer: Partial<ApiPotentialCustomer>;
}

export const PotentialCustomerFormDeleteHandler: FunctionComponent<
  IPotentialCustomerFormDeleteHandlerProps
> = ({
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
  potentialCustomer,
}) => {
  const { potentialCustomerDispatch } = useContext(PotentialCustomerContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { deletePotentialCustomer } = usePotentialCustomerData(
    !!integrationUser
  );

  const onSubmit = async (e: any) => {
    e.preventDefault();

    try {
      beforeSubmit();

      if (potentialCustomer.id) {
        await deletePotentialCustomer(potentialCustomer.id);

        potentialCustomerDispatch({
          type: PotentialCustomerActionTypes.DELETE_POTENTIAL_CUSTOMER,
          payload: potentialCustomer,
        });
      }

      toastSuccess("Interessent erfolgreich gelöscht!");
      postSubmit(true);
    } catch (err) {
      console.error(err);
      postSubmit(false);
    }
  };

  return (
    <form id={formId} onSubmit={onSubmit}>
      Möchten Sie den Interessenten wirklich löschen?
    </form>
  );
};

export default PotentialCustomerFormDeleteHandler;
