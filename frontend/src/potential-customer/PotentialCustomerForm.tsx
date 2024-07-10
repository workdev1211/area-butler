import { FC, useEffect, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import Input from "../components/inputs/formik/Input";
import TransportationParams from "../components/TransportationParams";
import LocalityParams from "../components/LocalityParams";
import ImportantAddresses from "../components/ImportantAddresses";
// import RealEstateCostStructureControl from "../real-estates/RealEstateCostStructureControl";
// import RealEstateCharacteristicsControl from "../real-estates/RealEstateCharacteristicsControl";
import { osmEntityTypes } from "../../../shared/constants/constants";

interface IPotentialCustomerFormProps {
  formId: string;
  inputCustomer: Partial<ApiPotentialCustomer>;
  onSubmit: (newValues: Partial<ApiPotentialCustomer>) => void;
  questionnaire?: boolean;
}

const PotentialCustomerForm: FC<IPotentialCustomerFormProps> = ({
  formId,
  inputCustomer,
  onSubmit,
  questionnaire,
}) => {
  const { t } = useTranslation();
  const [customer, setCustomer] =
    useState<Partial<ApiPotentialCustomer>>(inputCustomer);

  useEffect(() => {
    setCustomer(inputCustomer);
  }, [inputCustomer, setCustomer]);

  return (
    <Formik
      initialValues={customer}
      validationSchema={Yup.object({
        name: questionnaire
          ? Yup.string()
          : Yup.string().required(t(IntlKeys.potentialCustomers.nameRequired)),
        email: questionnaire ? Yup.string() : Yup.string().email(),
        preferredLocations: Yup.array(),
      })}
      enableReinitialize={true}
      onSubmit={(values) => onSubmit({ ...customer, ...values })}
    >
      <Form id={formId}>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!questionnaire && (
              <Input
                label={t(IntlKeys.potentialCustomers.nameOfTargetGroup)}
                name="name"
                type="text"
                onChange={(newValue) => {
                  setCustomer({
                    ...customer,
                    name: newValue.target.value,
                  });
                }}
                placeholder={t(IntlKeys.common.name)}
                className="input input-bordered w-full"
              />
            )}
            {/* Not used for the moment. Left just in case of possible future usage. */}
            {/*{!questionnaire && (*/}
            {/*  <Input*/}
            {/*    label="Email-Adresse des Interessenten"*/}
            {/*    name="email"*/}
            {/*    type="text"*/}
            {/*    onChange={(newValue) => {*/}
            {/*      setCustomer({*/}
            {/*        ...customer,*/}
            {/*        email: newValue.target.value,*/}
            {/*      });*/}
            {/*    }}*/}
            {/*    placeholder="Email"*/}
            {/*    className="input input-bordered w-full"*/}
            {/*  />*/}
            {/*)}*/}
          </div>
          <div className="my-6 flex flex-col gap-6">
            <strong>
              {questionnaire
                ? t(IntlKeys.potentialCustomers.myFavorite)
                : t(IntlKeys.potentialCustomers.preferred)}{" "}
              {t(IntlKeys.potentialCustomers.typesOfTransportations)}
            </strong>
            <TransportationParams
              values={customer.routingProfiles || []}
              onChange={(newValues) => {
                setCustomer({
                  ...customer,
                  routingProfiles: [...newValues],
                });
              }}
            />
          </div>
          <div className="my-6">
            <strong>
              {questionnaire
                ? t(IntlKeys.potentialCustomers.myFavorite)
                : t(IntlKeys.potentialCustomers.preferred)}{" "}
              {t(IntlKeys.potentialCustomers.localities)}
            </strong>
            <LocalityParams
              values={osmEntityTypes.filter((oet) =>
                (customer.preferredAmenities ?? []).includes(oet.name)
              )}
              onChange={(newValues) => {
                setCustomer({
                  ...customer,
                  preferredAmenities: [...newValues.map((v) => v.name)],
                });
              }}
            />
          </div>
          <div className="my-6 flex flex-col gap-4">
            <strong>{t(IntlKeys.potentialCustomers.importantAddresses)}</strong>
            <ImportantAddresses
              inputValues={customer.preferredLocations}
              onChange={(newValues) => {
                setCustomer({
                  ...customer,
                  preferredLocations: [...newValues],
                });
              }}
            />
          </div>
          {/* Not used for the moment. Left just in case of possible future usage. */}
          {/*<div className="my-6">*/}
          {/*  <strong>*/}
          {/*    {questionnaire ? "Meine" : "Bevorzugte"} Wohnvorstellung*/}
          {/*  </strong>*/}
          {/*</div>*/}
          {/*<RealEstateCostStructureControl*/}
          {/*  inputValues={customer.realEstateCostStructure}*/}
          {/*  onChange={(newValue) => {*/}
          {/*    setCustomer({*/}
          {/*      ...customer,*/}
          {/*      realEstateCostStructure: newValue,*/}
          {/*    });*/}
          {/*  }}*/}
          {/*/>*/}
          {/*<RealEstateCharacteristicsControl*/}
          {/*  inputValues={customer.realEstateCharacteristics}*/}
          {/*  onChange={(newValue) => {*/}
          {/*    setCustomer({*/}
          {/*      ...customer,*/}
          {/*      realEstateCharacteristics: newValue,*/}
          {/*    });*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
      </Form>
    </Formik>
  );
};

export default PotentialCustomerForm;
