import {PotentialCustomerActions, PotentialCustomerContext} from "context/PotentialCustomerContext";
import {useHttp} from "hooks/http";
import React from "react";
import {
    ApiPotentialCustomer,
    ApiPreferredLocation,
    ApiUpsertPotentialCustomer
} from "../../../shared/types/potential-customer";
import PotentialCustomerForm from "./PotentialCustomerForm";
import {useHistory} from "react-router-dom";
import { toastError, toastSuccess } from "shared/shared.functions";

export const mapFormToApiUpsertPotentialCustomer = async (
    values: any
): Promise<ApiUpsertPotentialCustomer> => {

    return {
        name: values.name,
        email: values.email,
        preferredAmenities: values.preferredAmenities,
        routingProfiles: values.routingProfiles,
        preferredLocations: values.preferredLocations.filter((pl: ApiPreferredLocation) => !!pl.title && !!pl.address),
        realEstateCharacteristics: values.realEstateCharacteristics,
        realEstateCostStructure: values.realEstateCostStructure
    };
};

export interface PotentialCustomerFormHandlerData {
    customer: Partial<ApiPotentialCustomer>;
    formId?: string;
    beforeSubmit?: () => void;
    postSubmit?: (success: boolean) => void;
}

const PotentialCustomerFormHandler: React.FunctionComponent<PotentialCustomerFormHandlerData> =
    ({
         formId, beforeSubmit = () => {
        }, postSubmit = () => {
        }, customer
     }) => {
        const {post, put} = useHttp();
        const history = useHistory();

        const {potentialCustomerDispatch} = React.useContext(
            PotentialCustomerContext
        );

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
                    type: PotentialCustomerActions.PUT_POTENTIAL_CUSTOMER,
                    payload: storedCustomer,
                });
                postSubmit(true);
                toastSuccess("Interessent erfolgreich gespeichert!");
                history.push(`/potential-customers/${storedCustomer.id}`);
            } catch (err) {
                console.log(err);
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
    }

export default PotentialCustomerFormHandler;
