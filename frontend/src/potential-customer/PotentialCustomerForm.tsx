import { Input } from "components/Input";
import { Form, Formik } from "formik";
import { useState } from "react";
import RealEstateCharacteristicsControl from "real-estate-listings/RealEstateCharacteristicsControl";
import RealEstateCostStructureControl from "real-estate-listings/RealEstateCostStructureControl";
import LocalityOptions from "search/Localitites";
import TransportationParams from "search/TransportationParams";
import * as Yup from "yup";
import {
  ApiPotentialCustomer,
  ApiPreferredLocation,
} from "../../../shared/types/potential-customer";
import {
  ApiRealEstateCharacteristics,
  ApiRealEstateCost,
} from "../../../shared/types/real-estate";
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

    const [realEstateCharacteristics, setRealEstateCharacteristics] =
      useState<ApiRealEstateCharacteristics>();

    const [realEstateCostStructure, setRealEstateCostStructure] =
      useState<ApiRealEstateCost>();

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
            realEstateCharacteristics,
            realEstateCostStructure
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
              <strong>
                {questionnaire ? "Meine bevorzugten" : "Bevorzugte"} Fortbewegungsarten
              </strong>
              <TransportationParams
                inputValues={routingProfiles}
                onChange={(values) => setRoutingProfiles(values)}
              ></TransportationParams>
            </div>
            <div className="my-6">
              <strong>
                {questionnaire ? "Meine bevorzugten" : "Bevorzugte"} Lokalitäten
              </strong>
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
            <div className="my-6">
              <PreferredLocationsControl
                inputValues={preferredLocations}
                onChange={(values) => setPreferredLocations(values)}
              />
            </div>
            {questionnaire && <div className="my-6"><strong>
                Meine Wohnvorstellung
              </strong></div>}
            <RealEstateCostStructureControl
              inputValues={customer.realEstateCostStructure}
              onChange={(values) => setRealEstateCostStructure(values)}
            ></RealEstateCostStructureControl>

            <RealEstateCharacteristicsControl
              inputValues={customer.realEstateCharacteristics}
              onChange={(values) => setRealEstateCharacteristics(values)}
            ></RealEstateCharacteristicsControl>
          </Form>
        )}
      ></Formik>
    );
  };

export default PotentialCustomerForm;
