import {FormModalData} from "components/FormModal";
import {PotentialCustomerActions, PotentialCustomerContext} from "context/PotentialCustomerContext";
import {useHttp} from "hooks/http";
import React from "react";
import {ApiPotentialCustomer} from "../../../shared/types/potential-customer";
import {toastSuccess} from "../shared/shared.functions";

export interface PotentialCustomerHandlerDeleteProps extends FormModalData {
    potentialCustomer: Partial<ApiPotentialCustomer>;
  }
  
  export const PotentialCustomerFormDeleteHandler: React.FunctionComponent<PotentialCustomerHandlerDeleteProps> =
    ({
      formId,
      beforeSubmit = () => {},
      postSubmit = () => {},
      potentialCustomer,
    }) => {
      const { deleteRequest } = useHttp();
      const { potentialCustomerDispatch } = React.useContext(PotentialCustomerContext);
  
      const onSubmit = async (event: any) => {
        event.preventDefault();
  
        try {
          beforeSubmit();
          if (!!potentialCustomer.id) {
            await deleteRequest(
              `/api/potential-customers/${potentialCustomer.id}`
            );
            potentialCustomerDispatch({
              type: PotentialCustomerActions.DELETE_POTENTIAL_CUSTOMER,
              payload: potentialCustomer,
            });
          }
          toastSuccess("Interessent erfolgreich gelöscht!");
          postSubmit(true);
        } catch (err) {
          console.log(err);
          postSubmit(false);
        }
      };
  
      return (
        <form id={formId} onSubmit={onSubmit}>
          Möchten Sie den Interessenten wirklich löschen?
        </form>
      );
    };
