import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import Input from "../components/Input";
import Checkbox from "../components/Checkbox";

export interface QuestionnaireRequestFormProps {
  formId: string;
  onSubmit: (values: any) => any;
}

export const QuestionnaireRequestForm: React.FunctionComponent<QuestionnaireRequestFormProps> =
  ({ formId, onSubmit }) => {
    return (
      <Formik
        initialValues={{
          name: "",
          email: "",
          userInCopy: true,
          userAgreement: false
        }}
        validationSchema={Yup.object({
          name: Yup.string().required("Bitte geben den Namen ein"),
          email: Yup.string()
            .email()
            .required("Bitte geben Sie eine gültige Email-Adresse ein"),
          preferredLocations: Yup.array(),
          userAgreement: Yup.boolean().oneOf([true], "Freigabe wird benötigt.")
        })}
        onSubmit={(values) => {
          const formValues = {
            ...values,
          };
          onSubmit(formValues);
        }}
        >
          <Form id={formId}>
            <div className="form-control">
              <Input
                label="Name des Interessenten"
                name="name"
                type="text"
                placeholder="Name"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <Input
                label="Email des Interessenten"
                name="email"
                type="text"
                placeholder="Email"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control my-5">
              <Checkbox name="userInCopy">
                Ich möchte die Mail in Kopie erhalten
              </Checkbox>
            </div>
            <p>
              Was passiert beim Klick auf <strong>Senden</strong>?
            </p>
            <ul className="list-decimal m-5 flex flex-col gap-3 text-sm">
              <li>
                Der AreaButler verschickt eine E-Mail an Ihren Interessenten.
                Diese E-Mail enthält einen Link.
              </li>
              <li>
                Über diesen kann Ihr Interessent nun seine bevorzugten
                Fortbewegungsarten und Lokalitäten sowie seine/ihre wichtigen
                Adressen eingeben.
              </li>
              <li>
                Das Ergebnis der Analyse sieht Ihr Interessent nicht - dies
                können Sie exklusiv bereitstellen.
              </li>
              <li>
                Sobald wir eine Antwort erhalten haben, erscheint der
                Interessent unter "Meine Interessenten" zur Schnellauswahl.
              </li>
            </ul>
            <p className="text-sm">
              Dadurch sparen Sie Zeit und Mühe und bieten einen persönlichen
              Extraservice.
            </p>
            <div className="form-control my-5">
              <Checkbox name="userAgreement">
                Der Kunde ist mit dem Erhalt von E-Mails vom AreaButler einverstanden
              </Checkbox>
            </div>
          </Form>
      </Formik>
    );
  };

export default QuestionnaireRequestForm;
