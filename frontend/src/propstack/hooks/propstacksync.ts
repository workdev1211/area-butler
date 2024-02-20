import { AxiosResponse } from "axios";

import { useHttp } from "../../hooks/http";
import {
  IApiIntCreateEstateLinkReq,
  IApiIntUpdEstTextFieldReq,
  IApiIntUploadEstateFileReq,
  IApiRealEstAvailIntStatuses,
  IApiSyncEstatesIntFilterParams,
  TSendToIntegrationData,
} from "../../../../shared/types/integration";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/integration-user";
import { toastError } from "../../shared/shared.functions";

export const usePropstackSync = () => {
  const { post, get, patch, put } = useHttp();

  const createPropertyLink = (
    createEstateLinkData: IApiIntCreateEstateLinkReq
  ): Promise<AxiosResponse<void>> =>
    post<void, IApiIntCreateEstateLinkReq>(
      "/api/propstack/property-link",
      createEstateLinkData
    );

  const uploadPropertyImage = (
    uploadEstateFileData: IApiIntUploadEstateFileReq
  ): Promise<AxiosResponse<void>> =>
    post<void, IApiIntUploadEstateFileReq>(
      "/api/propstack/property-image",
      uploadEstateFileData
    );

  const updatePropertyTextField = (
    updEstTextFieldData: IApiIntUpdEstTextFieldReq
  ): Promise<AxiosResponse<void>> =>
    patch<void, IApiIntUpdEstTextFieldReq>(
      "/api/propstack/property-text",
      updEstTextFieldData
    );

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
    sendToPropstackData: TSendToIntegrationData
  ): Promise<AxiosResponse<void>> => {
    switch (sendToPropstackData.exportType) {
      case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
      case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION:
      case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION: {
        return updatePropertyTextField(
          sendToPropstackData as IApiIntUpdEstTextFieldReq
        );
      }

      case AreaButlerExportTypesEnum.QR_CODE:
      case AreaButlerExportTypesEnum.SCREENSHOT:
      case AreaButlerExportTypesEnum.ONE_PAGE_PNG: {
        return uploadPropertyImage(
          sendToPropstackData as IApiIntUploadEstateFileReq
        );
      }

      case AreaButlerExportTypesEnum.EMBEDDED_LINK_WO_ADDRESS:
      case AreaButlerExportTypesEnum.EMBEDDED_LINK_WITH_ADDRESS: {
        return createPropertyLink(
          sendToPropstackData as IApiIntCreateEstateLinkReq
        );
      }
    }

    const errorMessage = "Falscher Exporttyp wurde angegeben!";
    toastError(errorMessage);
    console.error(errorMessage);
    throw new Error(errorMessage);
  };

  return { fetchAvailPropstackStatuses, handlePropstackSync, sendToPropstack };
};
