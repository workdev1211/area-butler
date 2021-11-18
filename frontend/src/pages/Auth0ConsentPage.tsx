import React, {useContext, useState} from "react";
import DefaultLayout from "../layout/defaultLayout";
import {useLocation} from "react-router-dom";
import Input from "../components/Input";
import {useHttp} from "../hooks/http";
import {v4 as uuid} from "uuid";
import {Form, Formik} from "formik";
import * as Yup from "yup";
import Checkbox from "../components/Checkbox";
import "./Auth0ConsentPage.css";
import {toastError} from "../shared/shared.functions";
import {ConfigContext} from "../context/ConfigContext";
import {localStorageInvitationCodeKey} from "../../../shared/constants/constants";

const Auth0ConsentPage: React.FunctionComponent = () => {
    const {post} = useHttp();
    const {auth, inviteCodeNeeded} = useContext(ConfigContext);

    const queryParams = new URLSearchParams(useLocation().search);
    const state = queryParams.get('state');

    const [busy, setBusy] = useState(false);

    const validateInviteCode = async (inviteCode: string) => {
        try {
            setBusy(true);
            await post<Boolean>('/api/invite-code', {inviteCode});
            return true;
        } catch {
            toastError("Dieser Einladungscode ist leider nicht gültig.");
            return false;
        } finally {
            setBusy(false);
        }
    }

    const onSubmit = async (values: any) => {
        if (inviteCodeNeeded) {
            const validCode = await validateInviteCode(values.inviteCode);
            window.localStorage.setItem(localStorageInvitationCodeKey, values.inviteCode);
            if (validCode && state) {
                window.location.href = `https://${auth.domain}/continue?state=${state}`;
            }
        } else {
            window.location.href = `https://${auth.domain}/continue?state=${state}`;
        }
    }

    const formId = `form-${uuid()}`;
    return (
      <DefaultLayout title="Registrierung" withHorizontalPadding={true}>
        <div className="w-1/3 mx-auto pt-20">
          <h2>Herzlich Willkommen</h2>
          {inviteCodeNeeded && (
            <p className="mt-10">
              Die Nutzung des Area Butler steht nur einem exklusiven Nutzerkreis
              zur Verfügung.
            </p>
          )}
          {inviteCodeNeeded && (
            <p>Bitte geben Sie nachfolgend Ihren Einladungscode ein.</p>
          )}
          <Formik
            initialValues={{
              inviteCode: "",
              consentGiven: false,
            }}
            validationSchema={Yup.object({
              inviteCode: inviteCodeNeeded
                ? Yup.string().required(
                    "Bitte geben Sie einen Einladungscode an."
                  )
                : Yup.string(),
              consentGiven: Yup.boolean().oneOf(
                [true],
                "Ihre Zustimmung wird benötigt."
              ),
            })}
            onSubmit={(values) => onSubmit(values)}
          >
            <Form id={formId}>
              {inviteCodeNeeded && (
                <Input
                  label="Einladungscode"
                  name="inviteCode"
                  type="text"
                  placeholder="XXXXXXXX"
                  className="input input-bordered w-full"
                />
              )}
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
          {inviteCodeNeeded && (
            <p className="mt-10">
              Sie haben keinen Einladungscode?
              {' '}
              <a
                className="text-primary"
                href="mailto:info@area-butler.de?subject=Anfrage zum Area Butler&body=Hallo,%0D%0Dsoeben bin ich auf euren Area Butler gestoßen und ihr habt mein Interesse geweckt. Gerne würde ich sofort loslegen.%0D%0DBitte schickt mir doch einen Einladungscode.%0D%0DIch freue mich auf eure Antwort.%0D%0DMit freundlichen Grüßen%0D"
              >
                Kontaktieren Sie uns
              </a>
              {' '} jetzt
            </p>
          )}
        </div>
      </DefaultLayout>
    );
}

export default Auth0ConsentPage;
