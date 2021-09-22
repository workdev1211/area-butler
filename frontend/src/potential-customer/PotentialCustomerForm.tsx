import { Input } from "components/Input";
import { Form, Formik, FieldArray } from "formik";
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
    const [preferredAmenities, setPreferredAmenities] = useState<OsmName[]>(
      customer.preferredAmenities ?? []
    );
    const [routingProfiles, setRoutingProfiles] = useState<
      TransportationParam[]
    >(customer.routingProfiles ?? []);

    return (
      <Formik
        initialValues={{
          name: customer.name || "",
          email: customer.email || "",
          preferredLocations: customer.preferredLocations || [],
        }}
        validationSchema={Yup.object({
          name: Yup.string().required("Bitte geben den Namen ein"),
          email: Yup.string()
            .email()
            .required("Bitte geben Sie eine gültige Email-Adresse ein"),
          preferredLocations: Yup.array()
        })}
        onSubmit={(values) => {
          const formValues = { ...values, preferredAmenities, routingProfiles };
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
              <div className="grid grid-cols-2 gap-6 mt-5">
                <FieldArray
                  name="preferredLocations"
                  render={(arrayHelpers) => (
                    <div>
                      {values.preferredLocations.map((location, index) => (
                        <div className="flex gap-4 items-end" key={`location-${index}`}>
                          <div className="form-control">
                            <Input
                              label="Bezeichnung"
                              name={`preferredLocations.${index}.title`}
                              type="text"
                              list="preferredLocationTitles"
                              placeholder="Name"
                            />
                          </div>
                          <div className="form-control flex-grow">
                            <Input
                              label="Adresse"
                              name={`preferredLocations.${index}.address`}
                              type="text"
                              placeholder="Name"
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-xs my-3 rounded-full"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            -
                          </button>
                        </div>
                      ))}
                      <datalist id="preferredLocationTitles">
                        <option value="Arbeitsort">Arbeitsort</option>
                        <option value="Eltern">Eltern</option>
                        <option value="Kita">Kita</option>
                        <option value="Schule">Schule</option>
                        <option value="Schwiegereltern">Schwiegereltern</option>
                      </datalist>  

                      {values.preferredLocations.length < 4 && <button
                        className="btn btn-xs my-4"
                        type="button"
                        onClick={() =>
                          arrayHelpers.push({ title: "", address: "" })
                        }
                      >
                        Neue Adresse
                      </button>}
                    </div>
                  )}
                />
              </div>
            </div>
          </Form>
        )}
      ></Formik>
    );
  };

export default PotentialCustomerForm;
