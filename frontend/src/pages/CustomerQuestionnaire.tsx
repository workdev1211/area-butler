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
  const [showFaq, setShowFaq] = useState(false);

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
    <div className="m-10">
      {!success && !error && (
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl my-5">Interessenten Fragebogen</h1>
          <PotentialCustomerForm
            questionnaire={true}
            formId={formId}
            onSubmit={onSubmit}
            customer={{}}
          ></PotentialCustomerForm>
          <hr className="mt-4" />
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
            Fragebogen absenden
          </button>
          <button
            className="mt-5 btn btn-xs w-32"
            onClick={() => setShowFaq(!showFaq)}
          >
            Häufige Fragen
          </button>
          {showFaq && (
            <div className="border p-3">
              <h1 className="font-bold mb-3">Häufige Fragen</h1>
              <ol className="list-decimal flex flex-col gap-2">
                <li className="ml-5">
                  Was passiert, wenn ich auf{" "}
                  <strong>Fragebogen absenden</strong> klicke?
                  <ul className="list-disc ml-10">
                    <li className="mt-2">
                      Ihr Area Butler macht sich nun daran, dass für Sie
                      passende Objekt am für Sie perfekten Ort zu finden
                    </li>
                    <li>
                      Ihre Mobilitätspräferenzen, persönlichen Kriterien und
                      Ihre wichtigsten Adressen fließen nun in{" "}
                      <strong>Ihre personalisierte Umfeldanalyse</strong> ein
                    </li>
                    <li>
                      Ihre persönliche Umfeldanalyse erhalten sie exklusiv von
                      Ihrem Immobilienmakler entweder per E-Mail oder im
                      Objekt-Exposee
                    </li>
                  </ul>
                </li>

                <li className="ml-5">
                  Wer sieht meine Angaben?
                  <ul className="list-disc ml-10">
                    <li className="mt-2">
                      Die Antworten sieht nur Ihr Immobilienmakler
                    </li>
                    <li>
                      Der Area Butler nutzt die Daten zu Aufbereitung Ihrer
                      persönlichen Umfeldanalyse
                    </li>
                  </ul>
                </li>

                <li className="ml-5">
                  Weitere Informationen unter{" "}
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
          <h1 className="text-2xl font-bold">Vielen Dank!</h1>
          <p className="w-100">
            Zusammen mit Ihrem Immobilienmakler bereite ich nun Ihre{" "}
            <strong>persönliche Umfeldanalyse</strong> auf.
          </p>
          <p>Diese erhalten Sie exklusiv in Ihrem Exposee oder per E-Mail.</p>
          <p>
            Ich hoffe Ihnen hat diese Abfrage gefallen. Ideen zu{" "}
            <strong>Verbesserung</strong>?<br />
            Geben Sie gern kurz Feedback Mit freundlichen Grüßen Ihr Area Butler
          </p>
          <p>
            Mehr Infos:{" "}<br/>
            <a href="www.area-butler.de">
              <strong>www.area-butler.de</strong>
            </a>
          </p>
        </div>
      )}
      {error && (
        <div m-10>
          <h1 className="text-2xl font-bold">Verzeihung!</h1>
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
