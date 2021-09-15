import { Input } from "components/Input";
import { Form, Formik } from "formik";
import { useState } from "react";
import LocalityOptions from "search/Localitites";
import TransportationParams from "search/TransportationParams";
import * as Yup from "yup";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import { OsmName, TransportationParam } from "../../../shared/types/types";

export interface PotentialCustomerFormData {
  formId: string;
  onSubmit: (values: any) => any;
  customer: Partial<ApiPotentialCustomer>;
}

export const PotentialCustomerForm: React.FunctionComponent<PotentialCustomerFormData> =
  ({ formId, onSubmit, customer }) => {
    const [preferredAmenities, setPreferredAmenities] = useState<OsmName[]>([]);
    const [routingProfiles, setRoutingProfiles] = useState<
      TransportationParam[]
    >([]);

    return (
      <Formik
        initialValues={{
          name: customer.name || "",
          email: customer.email || "",
        }}
        validationSchema={Yup.object({
          name: Yup.string().required("Bitte geben den Namen ein"),
          email: Yup.string()
            .email()
            .required("Bitte geben Sie eine gültige Email-Adresse ein"),
        })}
        onSubmit={(values) => {
          const formValues = { ...values, preferredAmenities, routingProfiles };
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
          <div className="my-6">
            <strong>Bevorzugte Transportmittel</strong>
            <TransportationParams
              defaults={customer.routingProfiles ?? []}
              onChange={(values) => setRoutingProfiles(values)}
            ></TransportationParams>
          </div>
          <div className="my-6">
            <strong>Bevorzugte Lokalitäten</strong>
            <div className="grid grid-cols-2 gap-6 mt-5">
              <LocalityOptions
                defaults={customer.preferredAmenities ?? []}
                onChange={(values) => setPreferredAmenities(values)}
              ></LocalityOptions>
            </div>
          </div>
        </Form>
      </Formik>
    );
  };

export default PotentialCustomerForm;
