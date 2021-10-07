import { Checkbox } from "components/Checkbox";
import { Input } from "components/Input";
import { Form, Formik } from "formik";
import { FunctionComponent } from "react";
import * as Yup from "yup";

export interface QuestionnaireRequestFormProps {
  formId: string;
  onSubmit: (values: any) => any;
}

export const QuestionnaireRequestForm: FunctionComponent<QuestionnaireRequestFormProps> =
  ({ formId, onSubmit }) => {
    return (
      <Formik
        initialValues={{
          name: "",
          email: "",
          userInCopy: true,
        }}
        validationSchema={Yup.object({
          name: Yup.string().required("Bitte geben den Namen ein"),
          email: Yup.string()
            .email()
            .required("Bitte geben Sie eine gültige Email-Adresse ein"),
          preferredLocations: Yup.array(),
        })}
        onSubmit={(values) => {
          const formValues = {
            ...values,
          };
          onSubmit(formValues);
        }}
        render={({ values }) => (
          <Form id={formId}>
            <div className="form-control">
              <Input
                label="Name des Interessenten"
                name="name"
                type="text"
                placeholder="Name"
              />
            </div>
            <div className="form-control">
              <Input
                label="Email des Interessenten"
                name="email"
                type="text"
                placeholder="Email"
              />
            </div>
            <div className="form-control my-5">
              <Checkbox name="userInCopy">
                Ich möchte die Mail in Kopie erhalten
              </Checkbox>
            </div>
            <p className="text-sm">
              Was passiert beim Klick auf <strong>Senden</strong>?
            </p>
            <ul className="list-decimal m-5 flex flex-col gap-3 text-xs">
              <li>
                Der Area Butler verschickt eine E-Mail an Ihren Interessenten.
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
          </Form>
        )}
      ></Formik>
    );
  };

export default QuestionnaireRequestForm;
