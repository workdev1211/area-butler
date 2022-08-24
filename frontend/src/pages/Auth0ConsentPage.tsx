import { Form, Formik } from "formik";
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { toastError } from "shared/shared.functions";
import { v4 as uuid } from "uuid";
import * as Yup from "yup";
import { localStorageConsentGivenKey } from "../../../shared/constants/constants";
import Checkbox from "../components/Checkbox";
import { ConfigContext } from "../context/ConfigContext";
import DefaultLayout from "../layout/defaultLayout";
import "./Auth0ConsentPage.scss";
import { TRIAL_DAYS } from "../../../shared/constants/subscription-plan";

const Auth0ConsentPage: React.FunctionComponent = () => {
  const { auth } = useContext(ConfigContext);

  const queryParams = new URLSearchParams(useLocation().search);
  const state = queryParams.get("state");

  const [busy, setBusy] = useState(false);

  const onSubmit = async (values: any) => {
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
        <p className="mt-5">
          Mit der Zustimmung der AGB und Datenschutzbestimmungen erhalten Sie
          für <strong>{TRIAL_DAYS} Tage</strong> eine{" "}
          <strong>kostenfreie Testphase</strong>, um den vollen
          Umfang des AreaButlers testen zu können. 
          <p>
          Zu unserer Sicherheit und um Missbrauch zu vermeiden, erfordert die Testphase ein hinterlegtes Zahlungsmittel. Dieses wird erst nach der Testphase belastet.
          </p>
        </p>
        <p>
        Sollten Sie während der Testphase nicht zufrieden sein, können Sie über Ihr Profil im AreaButler vom Kauf zurücktrete und die Testphase kostenfrei beenden.
        </p>
        <p>Viel Spaß beim Entdecken des AreaButlers, wir freuen uns auf Ihr Feedback!</p>
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
          onSubmit={(values) => onSubmit(values)}
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
