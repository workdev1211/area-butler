import { useHttp } from "hooks/http";
import PotentialCustomerForm from "potential-customer/PotentialCustomerForm";
import { mapFormToApiUpsertPotentialCustomer } from "potential-customer/PotentialCustomerFormHandler";
import React, { FunctionComponent, useState } from "react";

export const CustomerQuestionnaire: FunctionComponent = () => {
  const [token, setToken] = useState("");
  const formId = "customer-questionnaire";
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";
    setToken(token);
  }, []);

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
      console.log(err);
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl my-5">Interessenten Fragebogen</h1>
      {!success && !error && (
        <>
          <PotentialCustomerForm
            questionnaire={true}
            formId={formId}
            onSubmit={onSubmit}
            customer={{}}
          ></PotentialCustomerForm>
          <button
            form={formId}
            key="submit"
            type="submit"
            disabled={busy}
            className={
              busy
                ? "loading mt-5 btn btn-primary btn-sm"
                : "mt-5 btn btn-primary btn-sm"
            }
          >
            Fragebogen absenden
          </button>
        </>
      )}
      {success && (
        <div>
          <p>
            Herzlichen Dank für Ihre Eingabe!
            <br /> Die Daten wurden erfolgreich übermittelt.
          </p>
        </div>
      )}
      {error && (
        <div>
          <p>
            Leider gab es bei der Übermittlung der Daten ein Problem.
            <br />
            Bitte versuchen Sie es später noch einmal.
          </p>
        </div>
      )}
    </div>
  );
};
