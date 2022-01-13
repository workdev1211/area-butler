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
import "./Auth0ConsentPage.css";

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
        <h2>Herzlich Willkommen !</h2>
        <p className="mt-5">
          Mit der Zustimmung der AGBs und Datenschutzbestimmungen erhalten Sie für <strong>14 Tage</strong> eine <strong>kostenfreie Business+ Lizenz</strong>, um den vollen Funktionsumfang des Area Butlers testen zu können. 
          Sie müssen hierfür <strong>keinerlei</strong> Zahlungsdaten hinterlegen.
        </p>
        <p>
          Nach Ablauf der Testphase können Sie ein Abonemment wählen, das Ihre Anforderungen am Besten abdeckt.
          Auch danach können Sie <strong>jederzeit</strong> in ein anderes Abonnement wechseln.
        </p>
        <p>
          Viel Spaß beim Entdecken des Area Butlers !
        </p>
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
