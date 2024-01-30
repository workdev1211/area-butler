import { useContext } from "react";

import { ConfigContext } from "../../context/ConfigContext";
import { toastError } from "../../shared/shared.functions";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";
import { useOnOfficeSync } from "../../on-office/hooks/sync";
import { usePropstackSync } from "../../propstack/hooks/propstacksync";

export const useIntegrationSync = () => {
  const { integrationType } = useContext(ConfigContext);

  const { handleOnOfficeSync, fetchAvailOnOfficeStatuses } = useOnOfficeSync();
  const { handlePropstackSync, fetchAvailPropstackStatuses } =
    usePropstackSync();

  switch (integrationType) {
    case IntegrationTypesEnum.ON_OFFICE: {
      return {
        fetchAvailIntStatuses: fetchAvailOnOfficeStatuses,
        handleIntSync: handleOnOfficeSync,
      };
    }

    case IntegrationTypesEnum.PROPSTACK: {
      return {
        fetchAvailIntStatuses: fetchAvailPropstackStatuses,
        handleIntSync: handlePropstackSync,
      };
    }

    default: {
      const errorMessage = "Diese Integration ist nicht korrekt.";
      toastError(errorMessage);
      throw new Error(errorMessage);
    }
  }
};
