import { useHttp } from "hooks/http";
import PotentialCustomerForm from "potential-customer/PotentialCustomerForm";
import { mapFormToApiUpsertPotentialCustomer } from "potential-customer/PotentialCustomerFormHandler";
import React, { FunctionComponent, useState } from "react";
import { useParams } from "react-router-dom";

export interface CustomerQuestionnairePageRouterProps {
    inputToken: string;
}

const CustomerQuestionnairePage: FunctionComponent = () => {
    const { inputToken } = useParams<CustomerQuestionnairePageRouterProps>();
    const [token, setToken] = useState("");
    const formId = "customer-questionnaire";
    const [busy, setBusy] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [showFaq, setShowFaq] = useState(false);

    React.useEffect(() => {
        setToken(inputToken);
    }, [inputToken, setToken]);

    const { post } = useHttp();

    const onSubmit = async (values: any) => {
        const customer = await mapFormToApiUpsertPotentialCustomer(values);

        try {
            setBusy(true);
            await post("/api/potential-customers/questionnaire", {
                token,
                customer,
            });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="m-10">
            {!success && !error && (
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl my-5">Potential Customer Questionnaire</h1>
                    <PotentialCustomerForm
                        questionnaire={true}
                        formId={formId}
                        onSubmit={onSubmit}
                        inputCustomer={{
                          preferredLocations: [],
                          routingProfiles: []
                        }}
                    />
                    <hr className="mt-4"/>
                    <button
                        form={formId}
                        key="submit"
                        type="submit"
                        disabled={busy}
                        className={
                            busy
                                ? "loading mt-5 btn btn-primary btn-sm w-72"
                                : "mt-5 btn btn-primary btn-sm w-72"
                        }
                    >
                        Submit Questionnaire
                    </button>
                    <button
                        className="mt-5 btn btn-xs w-48"
                        onClick={() => setShowFaq(!showFaq)}
                    >
                        Frequently Asked Questions
                    </button>
                    {showFaq && (
                        <div className="border p-3">
                            <h1 className="font-bold mb-3">Frequently Asked Questions</h1>
                            <ol className="list-decimal flex flex-col gap-2">
                                <li className="ml-5">
                                    What happens when I click{" "}
                                    <strong>Submit Questionnaire</strong>?
                                    <ul className="list-disc ml-10">
                                        <li className="mt-2">
                                            Your AreaButler will start finding the perfect property for you at the ideal location.
                                        </li>
                                        <li>
                                            Your mobility preferences, personal criteria, and key addresses will now be considered in{" "}
                                            <strong>your personalized area analysis</strong>.
                                        </li>
                                        <li>
                                            You will receive your personal area analysis exclusively from your real estate agent, either via email or in the property exposé.
                                        </li>
                                    </ul>
                                </li>

                                <li className="ml-5">
                                    Who sees my information?
                                    <ul className="list-disc ml-10">
                                        <li className="mt-2">
                                            Only your real estate agent will see your responses.
                                        </li>
                                        <li>
                                            AreaButler will utilize the data to prepare your personal area analysis.
                                        </li>
                                    </ul>
                                </li>

                                <li className="ml-5">
                                    More information can be found at{" "}
                                    <a href="https://www.area-butler.de">
                                        <strong>www.area-butler.de</strong>
                                    </a>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>
            )}
            {success && (
                <div className="flex flex-col gap-3 m-10">
                    <h1 className="text-2xl font-bold">Thank You!</h1>
                    <p className="w-100">
                        Along with your real estate agent, I will now prepare your{" "}
                        <strong>personal area analysis</strong>.
                    </p>
                    <p>You will receive this exclusively in your exposé or via email.</p>
                    <p>
                        I hope you enjoyed this questionnaire. Suggestions for{" "}
                        <strong>improvement</strong>?<br/>
                        Please feel free to provide brief feedback. Best regards, your AreaButler.
                    </p>
                    <p>
                        More information:{" "}<br/>
                        <a href="https://www.area-butler.de">
                            <strong>www.area-butler.de</strong>
                        </a>
                    </p>
                </div>
            )}
            {error && (
                <div className="m-10">
                    <h1 className="text-2xl font-bold">Sorry!</h1>
                    <p>
                        Unfortunately, there was a problem with submitting the data.
                        <br/>
                        Please try again later.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CustomerQuestionnairePage;