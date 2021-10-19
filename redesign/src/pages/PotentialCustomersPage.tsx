import React, {useContext, useEffect} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {useHttp} from "../hooks/http";
import {PotentialCustomerActions, PotentialCustomerContext} from "../context/PotentialCustomerContext";
import {ApiPotentialCustomer} from "../../../shared/types/potential-customer";
import {allFurnishing, allRealEstateCostTypes} from "../../../shared/constants/real-estate";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import editIcon from "../assets/icons/icons-16-x-16-outline-ic-edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import {Link, useHistory} from "react-router-dom";
import FormModal from "../components/FormModal";
import {PotentialCustomerFormDeleteHandler} from "../potential-customer/PotentialCustomerDeleteHandler";

const deleteCustomerModalConfig = {
    modalTitle: "Interessent löschen",
    submitButtonTitle: "Löschen",
};

const PotentialCustomersPage: React.FunctionComponent = () => {
    const {get} = useHttp();
    const history = useHistory();
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
        <DefaultLayout title="Meine Interessenten" withHorizontalPadding={false} actionTop={<ActionsTop/>}>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>E-Mail</th>
                        <th>Wichtige Adressen</th>
                        <th>Wohnvorstellung</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    {potentialCustomerState.customers.map((customer: ApiPotentialCustomer) => (
                        <tr key={customer.id}>
                            <td>{customer.name}</td>
                            <td><a href={`mailto:${customer.email}`} className="link-primary">{customer.email}</a></td>
                            <td style={{width: "25%", whiteSpace: "pre-wrap"}}>
                                {Array.isArray(customer.preferredLocations) && customer.preferredLocations.length ? customer.preferredLocations
                                    .map((location) => location.title || "")
                                    .join(", ") : '-'}
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
                                <br/>
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
                            <td>
                                <div className="flex gap-4">
                                    <img src={editIcon} alt="icon-edit" className="cursor-pointer"
                                          onClick={() => history.push(`/potential-customers/${customer.id}`)}/>
                                    <FormModal modalConfig={{
                                        ...deleteCustomerModalConfig,
                                        modalButton: <img src={deleteIcon} alt="icon-delete"
                                                          className="cursor-pointer"/>
                                    }}>
                                        <PotentialCustomerFormDeleteHandler potentialCustomer={customer}/>
                                    </FormModal>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </DefaultLayout>
    );
};

export default PotentialCustomersPage;

