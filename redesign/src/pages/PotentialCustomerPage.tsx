import React, {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {v4 as uuid} from 'uuid';
import DefaultLayout from "../layout/defaultLayout";
import {useHttp} from "../hooks/http";
import {PotentialCustomerActions, PotentialCustomerContext} from "../context/PotentialCustomerContext";
import {ApiPotentialCustomer} from "../../../shared/types/potential-customer";
import PotentialCustomerFormHandler from "../potential-customer/PotentialCustomerFormHandler";
import BackButton from "../layout/BackButton";

export interface PotentialCustomerPageRouterProps {
    customerId: string;
}

const newCustomer: Partial<ApiPotentialCustomer> = {
    name: 'Neuer Interessent',
    email: 'vorname.nachname@kudiba.net',
    preferredLocations: [],
    routingProfiles: []
}

const PotentialCustomerPage: React.FunctionComponent = () => {
    const {customerId} = useParams<PotentialCustomerPageRouterProps>();
    const isNewCustomer = customerId === 'new';
    const [customer, setCustomer] = useState<Partial<ApiPotentialCustomer>>(newCustomer);
    const [busy, setBusy] = useState(false);

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
    }, [true]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isNewCustomer) {
            setCustomer(potentialCustomerState.customers.find((c: ApiPotentialCustomer) => c.id === customerId) ?? newCustomer);
        } else {
            setCustomer(newCustomer);
        }
    }, [potentialCustomerState.customers, isNewCustomer, customerId, setCustomer]);

    const formId = `form-${uuid()}`;
    const beforeSubmit = () => setBusy(true);
    const postSubmit = (success: boolean) => {
        setBusy(false);
    }

    const baseClasses = 'btn bg-primary-gradient w-full sm:w-auto';

    const SubmitButton: React.FunctionComponent = () => {
        const classes = baseClasses + ' ml-auto';
        return (
            <button form={formId} key="submit" type="submit" disabled={busy}
                    className={busy ? 'busy ' + classes : classes}>{ customer.id ? 'Speichern' : 'Anlegen' }</button>
        )
    }

    return (
        <DefaultLayout title={customer.name || 'Unbekannter Name'} withHorizontalPadding={true}
                       actionBottom={[<BackButton to="/potential-customers" key="customer-back"/>, <SubmitButton key="customer-submit" />]}>
            <div className="py-20">
                <PotentialCustomerFormHandler customer={customer} formId={formId} beforeSubmit={beforeSubmit}
                                              postSubmit={postSubmit}/>
            </div>
        </DefaultLayout>
    );
};

export default PotentialCustomerPage;

