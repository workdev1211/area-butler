import React, {useContext, useEffect} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {useHttp} from "../hooks/http";
import {PotentialCustomerActions, PotentialCustomerContext} from "../context/PotentialCustomerContext";
import {ApiPotentialCustomer} from "../../../shared/types/potential-customer";
import {allFurnishing, allRealEstateCostTypes} from "../../../shared/constants/real-estate";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import { Link } from "react-router-dom";

const PotentialCustomersPage: React.FunctionComponent = () => {
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
        fetchCustomers();
    }, [true]); // eslint-disable-line react-hooks/exhaustive-deps

    const ActionsTop: React.FunctionComponent = () => {
        return (<>
            <li>
                <Link
                    to="/potential-customers/new"
                    className="btn btn-link" style={{paddingLeft: 0}}
                >
                    <img src={plusIcon} alt="pdf-icon"/> Interessent anlegen
                </Link>
            </li>
        </>)
    }

    return (
        <DefaultLayout title="Meine Interessenten" withHorizontalPadding={false} actionTop={<ActionsTop />}>
            <div className="overflow-x-auto">
                <table className="table w-full text-sm">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Kontaktdaten</th>
                        <th>Wichtige Adressen</th>
                        <th>Wohnvorstellung</th>
                        <th />
                    </tr>
                    </thead>
                    <tbody>
                    {potentialCustomerState.customers.map((customer: ApiPotentialCustomer) => (
                        <tr key={customer.id}>
                            <td>{customer.name}</td>
                            <td>{customer.email}</td>


                            <td style={{ width: "25%", whiteSpace: "pre-wrap" }}>
                                {(customer.preferredLocations ?? [])
                                    .map((location) => location.title || "")
                                    .join(", ")}
                            </td>
                            <td>
                                {!!customer?.realEstateCostStructure?.type &&
                                !!customer?.realEstateCostStructure.price
                                    ? `${customer?.realEstateCostStructure.price.amount} € (${
                                        allRealEstateCostTypes.find(
                                            (t) =>
                                                t.type === customer?.realEstateCostStructure?.type
                                        )?.label
                                    })`
                                    : ""}
                                <br />
                                {customer?.realEstateCharacteristics?.furnishing &&
                                allFurnishing
                                    .filter((f) =>
                                        customer?.realEstateCharacteristics?.furnishing.includes(
                                            f.type
                                        )
                                    )
                                    .map((f) => f.label)
                                    .join(", ")}
                            </td>
                            <td>Actions</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </DefaultLayout>
    );
};

export default PotentialCustomersPage;

