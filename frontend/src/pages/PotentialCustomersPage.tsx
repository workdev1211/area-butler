import FormModal from "components/FormModal";
import { useHttp } from "hooks/http";
import { PotentialCustomerFormHandler } from "potential-customer/PotentialCustomerFormHandler";
import { useEffect, useState } from "react";
import { osmEntityTypes } from "../../../shared/constants/constants";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";
import {
  meansOfTransportations,
  unitsOfTransportation,
} from "../../../shared/constants/constants";
import {
  PotentialCustomerActions,
  PotentialCustomerContext,
} from "context/PotentialCustomerContext";
import React from "react";
import { PotentialCustomerFormDeleteHandler } from "potential-customer/PotentialCustomerDeleteHandler";
import QuestionnaireRequestFormHandler from "potential-customer/QuestionnaireRequestFormHandler";
import {
  allFurnishing,
  allRealEstateCostTypes,
} from "../../../shared/constants/real-estate";

export const PotentialCustomersPage = () => {
  const { get } = useHttp();
  const { potentialCustomerState, potentialCustomerDispatch } =
    React.useContext(PotentialCustomerContext);


  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    React.useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const customerId = params.get("customer-id") || "";
      console.log(customerId);
      if(!!customerId) {
        setSelectedCustomerId(customerId);
      }
    }, []);

  const createCustomerModalConfig = {
    modalTitle: "Interessent erstellen",
    buttonTitle: "Interessent Erstellen",
    buttonStyle: "btn btn-sm",
  };

  const createCustomerQuestionnaireModalConfig = {
    modalTitle: "Fragebogen versenden",
    buttonTitle: "Fragebogen versenden",
    buttonStyle: "btn btn-sm",
    submitButtonTitle: "Senden",
  };

  const editCustomerModalConfig = {
    modalTitle: "Interessent bearbeiten",
    buttonTitle: "Bearbeiten",
    buttonStyle: "btn btn-xs mr-2",
  };

  const deleteCustomerModalConfig = {
    modalTitle: "Interessent löschen",
    buttonTitle: "Löschen",
    buttonStyle: "btn btn-xs btn-primary",
    submitButtonTitle: "Löschen",
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      potentialCustomerDispatch({
        type: PotentialCustomerActions.SET_POTENTIAL_CUSTOMERS,
        payload: (await get<ApiPotentialCustomer[]>("/api/potential-customers"))
          .data,
      });
    };
    fetchCustomers();
  }, [true]);

  return (
    <div className="container mx-auto mt-10">
      <h1 className="flex text-2xl">Meine Interessenten</h1>
      <div className="my-4 flex gap-5">
        <FormModal modalConfig={createCustomerModalConfig}>
          <PotentialCustomerFormHandler
            customer={{}}
          ></PotentialCustomerFormHandler>
        </FormModal>
        <FormModal modalConfig={createCustomerQuestionnaireModalConfig}>
          <QuestionnaireRequestFormHandler></QuestionnaireRequestFormHandler>
        </FormModal>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kontaktdaten</th>
              <th>Bewegungsprofile</th>
              <th>Bevorzugte Umgebung</th>
              <th>Wichtige Adressen</th>
              <th>Wohnvorstellung</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {potentialCustomerState.customers.map(
              (customer: ApiPotentialCustomer) => (
                <tr key={customer.id} className={customer.id === selectedCustomerId ? 'active' : ''}>
                  <th>{customer.name}</th>
                  <td>{customer.email}</td>
                  <td>
                    {(customer.routingProfiles ?? []).map((routingProfile) => (
                      <div
                        key={`customer-${customer.id}-routing-profile-${routingProfile.type}`}
                      >
                        <span>
                          {
                            meansOfTransportations.find(
                              (means) => means.type === routingProfile.type
                            )?.label
                          }{" "}
                          ({routingProfile.amount}{" "}
                          {
                            unitsOfTransportation.find(
                              (unit) => unit.type === routingProfile.unit
                            )?.label
                          }
                          )
                        </span>
                        <br />
                      </div>
                    ))}
                  </td>
                  <td style={{ width: "25%", whiteSpace: "pre-wrap" }}>
                    {(customer.preferredAmenities ?? [])
                      .map(
                        (amenity) =>
                          osmEntityTypes.find((t) => t.name === amenity)
                            ?.label || ""
                      )
                      .join(", ")}
                  </td>
                  <td style={{ width: "25%", whiteSpace: "pre-wrap" }}>
                    {(customer.preferredLocations ?? [])
                      .map((location) => location.title || "")
                      .join(", ")}
                  </td>
                  <td>
                    {!!customer?.realEstateCostStructure?.type &&
                    !!customer?.realEstateCostStructure.price
                      ? `${customer?.realEstateCostStructure.price.amount} € (${
                          allRealEstateCostTypes.find(
                            (t) =>
                              t.type === customer?.realEstateCostStructure?.type
                          )?.label
                        })`
                      : ""}
                    <br />
                    {customer?.realEstateCharacteristics?.furnishing &&
                      allFurnishing
                        .filter((f) =>
                          customer?.realEstateCharacteristics?.furnishing.includes(
                            f.type
                          )
                        )
                        .map((f) => f.label)
                        .join(", ")}
                  </td>
                  <td>
                    <FormModal modalConfig={editCustomerModalConfig}>
                      <PotentialCustomerFormHandler
                        customer={customer}
                      ></PotentialCustomerFormHandler>
                    </FormModal>
                    <FormModal modalConfig={deleteCustomerModalConfig}>
                      <PotentialCustomerFormDeleteHandler
                        potentialCustomer={customer}
                      ></PotentialCustomerFormDeleteHandler>
                    </FormModal>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
