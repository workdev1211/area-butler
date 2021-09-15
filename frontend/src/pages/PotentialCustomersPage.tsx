import FormModal from "components/FormModal";
import { useHttp } from "hooks/http";
import { PotentialCustomerFormHandler } from "potential-customer/PotentialCustomerFormHandler";
import { useEffect } from "react";
import usePotentialCustomerState from "state/potential-customer";
import { osmEntityTypes } from "../../../shared/constants/constants";
import { ApiPotentialCustomer } from "../../../shared/types/potential-customer";

export const PotentialCustomersPage = () => {
  const { get } = useHttp();
  const { potentialCustomersState, setPotentialCustomers } =
    usePotentialCustomerState();

  const createCustomerModalConfig = {
    modalTitle: "Interessent erstellen",
    buttonTitle: "Interessent Erstellen",
    buttonStyle: "btn btn-sm",
  };

  const editCustomerModalConfig = {
    modalTitle: "Interessent bearbeiten",
    buttonTitle: "Bearbeiten",
    buttonStyle: "btn btn-xs",
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      setPotentialCustomers(
        (await get<ApiPotentialCustomer[]>("/api/potential-customers")).data
      );
    };
    fetchCustomers();
  }, [true]);

  return (
    <div className="container mx-auto mt-10">
      <h1 className="flex text-2xl">Meine Interessenten</h1>
      <div className="my-4">
        <FormModal modalConfig={createCustomerModalConfig}>
          <PotentialCustomerFormHandler
            customer={{}}
          ></PotentialCustomerFormHandler>
        </FormModal>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kontaktdaten</th>
              <th>Bewegungsprofile</th>
              <th>Bevorzugte Umgebung</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {potentialCustomersState.customers.map((customer) => (
              <tr key={customer.id}>
                <th>{customer.name}</th>
                <td>{customer.email}</td>
                <td></td>
                <td>
                  {(customer.preferredAmenities ?? [])
                    .map(
                      (amenity) =>
                        osmEntityTypes.find((t) => t.name === amenity)?.label ||
                        ""
                    )
                    .join(", ")}
                </td>
                <td>
                  <FormModal modalConfig={editCustomerModalConfig}>
                    <PotentialCustomerFormHandler
                      customer={customer}
                    ></PotentialCustomerFormHandler>
                  </FormModal>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
