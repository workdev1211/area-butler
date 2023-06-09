import { useContext } from "react";

import { useHttp } from "./http";
import {
  ApiPotentialCustomer,
  ApiUpsertPotentialCustomer,
} from "../../../shared/types/potential-customer";
import { UserContext } from "../context/UserContext";

export const usePotentialCustomerData = () => {
  // TODO refactor to the useTools hook
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const { post, get, put, deleteRequest } = useHttp();

  const isIntegrationUser = !!integrationUser;

  const createPotentialCustomer = async (
    potentialCustomer: ApiUpsertPotentialCustomer
  ): Promise<ApiPotentialCustomer> => {
    return (
      await post<ApiPotentialCustomer>(
        isIntegrationUser
          ? "/api/potential-customers-int"
          : "/api/potential-customers",
        potentialCustomer
      )
    ).data;
  };

  const fetchPotentialCustomers = async (): Promise<ApiPotentialCustomer[]> => {
    return (
      await get<ApiPotentialCustomer[]>(
        isIntegrationUser
          ? "/api/potential-customers-int"
          : "/api/potential-customers"
      )
    ).data;
  };

  const updatePotentialCustomer = async (
    potentialCustomerId: string,
    potentialCustomer: ApiUpsertPotentialCustomer
  ): Promise<ApiPotentialCustomer> => {
    return (
      await put<ApiPotentialCustomer>(
        isIntegrationUser
          ? `/api/potential-customers-int/${potentialCustomerId}`
          : `/api/potential-customers/${potentialCustomerId}`,
        potentialCustomer
      )
    ).data;
  };

  const deletePotentialCustomer = async (
    potentialCustomerId: string
  ): Promise<void> => {
    await deleteRequest<void>(
      isIntegrationUser
        ? `/api/potential-customers-int/${potentialCustomerId}`
        : `/api/potential-customers/${potentialCustomerId}`
    );
  };

  return {
    createPotentialCustomer,
    fetchPotentialCustomers,
    updatePotentialCustomer,
    deletePotentialCustomer,
  };
};
