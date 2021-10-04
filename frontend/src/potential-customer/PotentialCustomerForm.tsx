import { Input } from "components/Input";
import { ConfigContext } from "context/ConfigContext";
import { Form, Formik, FieldArray } from "formik";
import { useContext, useState } from "react";
import LocalityOptions from "search/Localitites";
import TransportationParams from "search/TransportationParams";
import * as Yup from "yup";
import {
  ApiPotentialCustomer,
  ApiPreferredLocation,
} from "../../../shared/types/potential-customer";
import { OsmName, TransportationParam } from "../../../shared/types/types";
import { PreferredLocationsControl } from "./PreferredLocationsControl";

export interface PotentialCustomerFormData {
  formId: string;
  onSubmit: (values: any) => any;
  customer: Partial<ApiPotentialCustomer>;
  questionnaire?: boolean;
}

export const PotentialCustomerForm: React.FunctionComponent<PotentialCustomerFormData> =
  ({ formId, onSubmit, customer, questionnaire = false }) => {
    const [preferredAmenities, setPreferredAmenities] = useState<OsmName[]>(
      customer.preferredAmenities ?? []
    );
    const [routingProfiles, setRoutingProfiles] = useState<
      TransportationParam[]
    >(customer.routingProfiles ?? []);

    const [preferredLocations, setPreferredLocations] = useState<
      ApiPreferredLocation[]
    >(customer.preferredLocations ?? []);

    return (
      <Formik
        initialValues={{
          name: customer.name || "",
          email: customer.email || "",
          preferredLocations: customer.preferredLocations || [],
        }}
        validationSchema={Yup.object({
          name: questionnaire
            ? Yup.string()
            : Yup.string().required("Bitte geben den Namen ein"),
          email: questionnaire
            ? Yup.string()
            : Yup.string()
                .email()
                .required("Bitte geben Sie eine gültige Email-Adresse ein"),
          preferredLocations: Yup.array(),
        })}
        onSubmit={(values) => {
          const formValues = {
            ...values,
            preferredAmenities,
            routingProfiles,
            preferredLocations,
          };
          onSubmit(formValues);
        }}
        render={({ values }) => (
          <Form id={formId}>
            {!questionnaire && (
              <div className="form-control">
                <Input
                  label="Name des Interessenten"
                  name="name"
                  type="text"
                  placeholder="Name"
                />
              </div>
            )}

            {!questionnaire && (
              <div className="form-control">
                <Input
                  label="Email des Interessenten"
                  name="email"
                  type="text"
                  placeholder="Email"
                />
              </div>
            )}
            <div className="my-6">
              <strong>Bevorzugte Fortbewegungsarten</strong>
              <TransportationParams
                inputValues={routingProfiles}
                onChange={(values) => setRoutingProfiles(values)}
              ></TransportationParams>
            </div>
            <div className="my-6">
              <strong>Bevorzugte Lokalitäten</strong>
              <div className="grid grid-cols-2 gap-6 mt-5">
                <LocalityOptions
                  inputValues={preferredAmenities}
                  onChange={(values) => setPreferredAmenities(values)}
                ></LocalityOptions>
              </div>
            </div>
            <div className="my-6">
              <strong>Wichtige Adressen</strong>
            </div>
            <PreferredLocationsControl
              inputValues={preferredLocations}
              onChange={(values) => setPreferredLocations(values)}
            />
          </Form>
        )}
      ></Formik>
    );
  };

export default PotentialCustomerForm;
