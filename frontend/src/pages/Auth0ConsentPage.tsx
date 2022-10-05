import { FunctionComponent, useContext, useState } from "react";
import { Form, Formik } from "formik";
import { useLocation } from "react-router-dom";
import { v4 as uuid } from "uuid";
import * as Yup from "yup";

import { toastError } from "shared/shared.functions";
import { localStorageConsentGivenKey } from "../../../shared/constants/constants";
import Checkbox from "../components/Checkbox";
import { ConfigContext } from "../context/ConfigContext";
import DefaultLayout from "../layout/defaultLayout";
import "./Auth0ConsentPage.scss";
import { TRIAL_DAYS } from "../../../shared/constants/subscription-plan";

const Auth0ConsentPage: FunctionComponent = () => {
  const { auth } = useContext(ConfigContext);

  const queryParams = new URLSearchParams(useLocation().search);
  const state = queryParams.get("state");

  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    try {
      localStorage.setItem(localStorageConsentGivenKey, "true");
      window.location.href = `https://${auth.domain}/continue?state=${state}`;
    } catch (e) {
      toastError("Leider ist etwas bei der Zustimmung schiefgelaufen");
    } finally {
      setBusy(false);
    }
  };

  const formId = `form-${uuid()}`;

  return (
    <DefaultLayout title="Registrierung" withHorizontalPadding={true}>
      <div className="w-1/3 mx-auto pt-20">
        <h2>Herzlich willkommen !</h2>
        <div className="mt-5 text-justify">
          <p>
            Mit der Zustimmung der AGB und Datenschutzbestimmungen, erhalten Sie
            für <strong>{TRIAL_DAYS} Tage</strong> eine{" "}
            <strong>kostenfreie Testphase</strong>, um den vollen Umfang des
            AreaButlers an <strong>4 Adressen</strong> in Deutschland zu testen.
          </p>
          <p>
            Die Analysen und Export-Materialien sind in der Testphase mit
            Wasserzeichen versehen.
          </p>
          <p>
            Am Ende der Testphase können Sie sich für einen Plan entscheiden,
            der Ihren Anforderungen entspricht. Es findet keine automatische
            Umwandlung oder Verlängerung statt.
          </p>
          <p>
            Hinweis: Aus Datenschutzgründen werden alle Daten aus Ihrem
            Testaccount gelöscht und nicht in Ihren „echten“ Account übertragen.
            Über Ihr AreaButler Profil können Sie auch vor Ablauf der 4 Tage mit
            Ihrem Plan starten.
          </p>
          <p>
            Viel Spaß beim Testen des AreaButlers, wir freuen uns, dass Sie
            unseren Service nutzen!
          </p>
          <p>Ihr Team AreaButler</p>
        </div>
        <Formik
          initialValues={{
            consentGiven: false,
          }}
          validationSchema={Yup.object({
            consentGiven: Yup.boolean().oneOf(
              [true],
              "Ihre Zustimmung wird benötigt."
            ),
          })}
          onSubmit={onSubmit}
        >
          <Form id={formId}>
            <div className="form-control mt-5">
              <Checkbox name="consentGiven">
                <div className="checkbox-container font-normal text-base">
                  Hiermit stimme ich den{" "}
                  <a target="_blank" className="link-primary" href="/terms">
                    AGB
                  </a>{" "}
                  und den{" "}
                  <a target="_blank" className="link-primary" href="/privacy">
                    Datenschutzbestimmungen
                  </a>{" "}
                  zu.
                </div>
              </Checkbox>
            </div>
          </Form>
        </Formik>
        <button
          form={formId}
          key="submit"
          type="submit"
          className={
            busy ? "busy btn btn-primary mt-5" : "btn btn-primary mt-5"
          }
        >
          Registrieren
        </button>
      </div>
    </DefaultLayout>
  );
};

export default Auth0ConsentPage;
