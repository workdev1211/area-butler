import React, {useEffect, useState} from "react";
import {ApiPotentialCustomer} from "../../../shared/types/potential-customer";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import Input from "../components/Input";
import TransportationParams from "../components/TransportationParams";
import LocalityParams from "../components/LocalityParams";
import {osmEntityTypes} from "../../../shared/constants/constants";
import ImportantAddresses from "../components/ImportantAddresses";

export interface PotentialCustomerFormProps {
    formId: string;
    inputCustomer: Partial<ApiPotentialCustomer>,
    onSubmit: (newValues: Partial<ApiPotentialCustomer>) => void,
    questionnaire?: boolean;
}

const PotentialCustomerForm: React.FunctionComponent<PotentialCustomerFormProps> = ({
                                                                                        formId,
                                                                                        inputCustomer,
                                                                                        onSubmit,
                                                                                        questionnaire
                                                                                    }) => {

    const [customer, setCustomer] = useState<Partial<ApiPotentialCustomer>>(inputCustomer);

    useEffect(() => {
        setCustomer(inputCustomer);
    }, [inputCustomer, setCustomer]);

    return (
        <Formik
            initialValues={customer} validationSchema={Yup.object({
            name: questionnaire
                ? Yup.string()
                : Yup.string().required('Name wird benötigt'),
            email: questionnaire
                ? Yup.string()
                : Yup.string().email().required('Gültige Email-Adresse wird benötigt'),
            preferredLocations: Yup.array()
        })}
            enableReinitialize={true}
            onSubmit={(values) => onSubmit({...customer, ...values})}
        >{(formikValues) =>
            <Form id={formId}>
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!questionnaire && (<Input label="Name des Interessenten"
                                               name="name"
                                               type="text"
                                               placeholder="Name" className="input input-bordered w-full"/>)}
                    {!questionnaire && (<Input label="Email-Adresse des Interessenten"
                                               name="email"
                                               type="text"
                                               placeholder="Email" className="input input-bordered w-full"/>)}
                    </div>
                    <div className="my-6 flex flex-col gap-6">
                        <strong>{questionnaire ? "Meine bevorzugten" : "Bevorzugte"} Fortbewegungsarten</strong>
                        <TransportationParams values={customer.routingProfiles || []}
                                              onChange={(newValues) => setCustomer({
                                                  ...customer,
                                                  routingProfiles: [...newValues]
                                              })}/>
                    </div>
                    <div className="my-6">
                        <strong>{questionnaire ? "Meine bevorzugten" : "Bevorzugte"} Lokalitäten</strong>
                        <LocalityParams
                            values={osmEntityTypes.filter(oet => (customer.preferredAmenities ?? []).includes(oet.name))}
                            onChange={(newValues) => setCustomer({
                                ...customer,
                                preferredAmenities: [...newValues.map(v => v.name)]
                            })}/>
                    </div>
                    <div className="my-6 flex flex-col gap-4">
                        <strong>Wichtige Adressen</strong>
                        <ImportantAddresses inputValues={customer.preferredLocations}
                                            onChange={(newValues) => setCustomer({
                                                ...customer,
                                                preferredLocations: [...newValues]
                                            })}/>
                    </div>
                </div>
            </Form>
                }
        </Formik>
    )
}

export default PotentialCustomerForm;
