import { useHttp } from "../../hooks/http";
import {
  IApiIntUpdEstTextFieldReq,
  IApiRealEstAvailIntStatuses,
  IApiSyncEstatesIntFilterParams,
} from "../../../../shared/types/integration";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/integration-user";
import { IApiPropstackUplPropImgReq } from "../../../../shared/types/propstack";
import { toastError } from "../../shared/shared.functions";

export const usePropstackSync = () => {
  const { post, get, patch, put } = useHttp();

  const fetchAvailPropstackStatuses =
    async (): Promise<IApiRealEstAvailIntStatuses> => {
      return (
        await get<IApiRealEstAvailIntStatuses>("/api/propstack/avail-statuses")
      ).data;
    };

  const handlePropstackSync = async (
    estateStatusParams?: IApiSyncEstatesIntFilterParams
  ): Promise<string[]> => {
    return (
      await put<string[]>("/api/propstack/sync-estates", estateStatusParams)
    ).data;
  };

  const sendToPropstack = async (
    sendToPropstackData: IApiIntUpdEstTextFieldReq | IApiPropstackUplPropImgReq,
    realEstateIntId: string
  ): Promise<void> => {
    switch (sendToPropstackData.exportType) {
      case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
      case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION:
      case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION: {
        if ("text" in sendToPropstackData) {
          await patch<void, IApiIntUpdEstTextFieldReq>(
            `/api/propstack/property-text/${realEstateIntId}`,
            sendToPropstackData
          );

          return;
        }

        break;
      }

      case AreaButlerExportTypesEnum.SCREENSHOT: {
        if ("fileTitle" in sendToPropstackData) {
          await post<void, IApiPropstackUplPropImgReq>(
            `/api/propstack/property-image/${realEstateIntId}`,
            sendToPropstackData
          );

          return;
        }

        break;
      }
    }

    const errorMessage = "Falscher Exporttyp wurde angegeben!";
    console.error(errorMessage);
    toastError(errorMessage);
    throw new Error(errorMessage);
  };

  return { fetchAvailPropstackStatuses, handlePropstackSync, sendToPropstack };
};
