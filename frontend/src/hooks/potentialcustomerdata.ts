import { useContext } from "react";

import { useHttp } from "./http";
import {
  ApiPotentialCustomer,
  ApiUpsertPotentialCustomer,
} from "../../../shared/types/potential-customer";
import { ConfigContext } from "../context/ConfigContext";

export const usePotentialCustomerData = () => {
  const { integrationType } = useContext(ConfigContext);
  const { post, get, put, deleteRequest } = useHttp();

  const isIntegration = !!integrationType;

  const createPotentialCustomer = async (
    potentialCustomer: ApiUpsertPotentialCustomer
  ): Promise<ApiPotentialCustomer> => {
    return (
      await post<ApiPotentialCustomer>(
        isIntegration
          ? "/api/potential-customers-int"
          : "/api/potential-customers",
        potentialCustomer
      )
    ).data;
  };

  const fetchPotentialCustomers = async (): Promise<ApiPotentialCustomer[]> => {
    return (
      await get<ApiPotentialCustomer[]>(
        isIntegration
          ? "/api/potential-customers-int"
          : "/api/potential-customers"
      )
    ).data;
  };

  const fetchPotentCustomerNames = async (): Promise<string[]> => {
    return (
      await get<string[]>(
        isIntegration
          ? "/api/potential-customers-int/names"
          : "/api/potential-customers/names"
      )
    ).data;
  };

  const updatePotentialCustomer = async (
    potentialCustomerId: string,
    potentialCustomer: ApiUpsertPotentialCustomer
  ): Promise<ApiPotentialCustomer> => {
    return (
      await put<ApiPotentialCustomer>(
        isIntegration
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
      isIntegration
        ? `/api/potential-customers-int/${potentialCustomerId}`
        : `/api/potential-customers/${potentialCustomerId}`
    );
  };

  return {
    createPotentialCustomer,
    fetchPotentialCustomers,
    fetchPotentCustomerNames,
    updatePotentialCustomer,
    deletePotentialCustomer,
  };
};
