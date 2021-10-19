import React, {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import DefaultLayout from "../layout/defaultLayout";
import {useHttp} from "../hooks/http";
import {PotentialCustomerActions, PotentialCustomerContext} from "../context/PotentialCustomerContext";
import {ApiPotentialCustomer} from "../../../shared/types/potential-customer";

export interface PotentialCustomerPageRouterProps {
    customerId: string;
}

const PotentialCustomerPage: React.FunctionComponent = () => {
    const {customerId} = useParams<PotentialCustomerPageRouterProps>();
    const isNewCustomer = customerId === 'new';
    const [customer, setCustomer] = useState<ApiPotentialCustomer | null>(null);

    const {get} = useHttp();
    const {potentialCustomerState, potentialCustomerDispatch} = useContext(PotentialCustomerContext);

    useEffect(() => {
        const fetchCustomers = async () => {
            const response = await get<ApiPotentialCustomer[]>('/api/potential-customers');
            potentialCustomerDispatch({
                type: PotentialCustomerActions.SET_POTENTIAL_CUSTOMERS,
                payload: response.data
            })
        };
        void fetchCustomers();
    }, [get, potentialCustomerDispatch]);

    useEffect(() => {
        if (!isNewCustomer) {
            setCustomer(potentialCustomerState.customers.find((c: ApiPotentialCustomer) => c.id === customerId));
        } else {
            setCustomer(null);
        }
    }, [potentialCustomerState.customers, isNewCustomer, customerId, setCustomer]);

    return (
        <DefaultLayout title={isNewCustomer ? 'Neuer Interessent' : (customer?.name || 'Unbekannter Name')} withHorizontalPadding={true}>
            <div>Test {customerId}</div>
        </DefaultLayout>
    );
};

export default PotentialCustomerPage;

