import { AxiosResponse } from "axios";

import { useHttp } from "../../hooks/http";
import {
  // IApiIntCreateEstateLinkReq,
  IApiIntSetPropPubLinksReq,
  IApiIntUpdEstTextFieldReq,
  IApiIntUploadEstateFileReq,
  IApiRealEstAvailIntStatuses,
  IApiSyncEstatesIntFilterParams,
  TSendToIntegrationData,
} from "../../../../shared/types/integration";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { toastError } from "../../shared/shared.functions";
import { AreaButlerExportTypesEnum } from "../../../../shared/types/types";

export const useOnOfficeSync = () => {
  const { post, get, patch, put } = useHttp();

  // Reserved for possible future use
  // const createEstateLink = (
  //   createEstateLinkData: IApiIntCreateEstateLinkReq
  // ): Promise<AxiosResponse<void>> =>
  //   post<void, IApiIntCreateEstateLinkReq>(
  //     "/api/on-office/estate-link",
  //     createEstateLinkData
  //   );

  const setPropPublicLinks = (
    propPublicLinkData: IApiIntSetPropPubLinksReq
  ): Promise<AxiosResponse<void>> =>
    post<void, IApiIntSetPropPubLinksReq>(
      "/api/on-office/property-public-links",
      propPublicLinkData
    );

  const uploadEstateFile = (
    uploadEstateFileData: IApiIntUploadEstateFileReq
  ): Promise<AxiosResponse<void>> =>
    post<void, IApiIntUploadEstateFileReq>(
      "/api/on-office/estate-file",
      uploadEstateFileData
    );

  const updateEstateTextField = (
    updEstTextFieldData: IApiIntUpdEstTextFieldReq
  ): Promise<AxiosResponse<void>> =>
    patch<void, IApiIntUpdEstTextFieldReq>(
      "/api/on-office/estate-text",
      updEstTextFieldData
    );

  const fetchAvailOnOfficeStatuses =
    async (): Promise<IApiRealEstAvailIntStatuses> => {
      return (
        await get<IApiRealEstAvailIntStatuses>("/api/on-office/avail-statuses")
      ).data;
    };

  const handleOnOfficeSync = async (
    estateStatusParams?: IApiSyncEstatesIntFilterParams
  ): Promise<string[]> => {
    return (
      await put<string[]>("/api/on-office/sync-estates", estateStatusParams)
    ).data;
  };

  const sendToOnOffice = async (
    sendToOnOfficeData: TSendToIntegrationData
  ): Promise<AxiosResponse<void>> => {
    switch (sendToOnOfficeData.exportType) {
      case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
      case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION:
      case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
      case AreaButlerExportTypesEnum.INLINE_FRAME: {
        return updateEstateTextField(
          sendToOnOfficeData as IApiIntUpdEstTextFieldReq
        );
      }

      case AreaButlerExportTypesEnum.QR_CODE:
      case AreaButlerExportTypesEnum.SCREENSHOT:
      case AreaButlerExportTypesEnum.ONE_PAGE_PNG: {
        if (sendToOnOfficeData.filename) {
          sendToOnOfficeData.filename = sendToOnOfficeData.filename.replace(
            /[/\\?%*:|"<>\s,]/g,
            "-"
          );
        }

        return uploadEstateFile(
          sendToOnOfficeData as IApiIntUploadEstateFileReq
        );
      }

      case AreaButlerExportTypesEnum.EMBEDDED_LINKS: {
        return setPropPublicLinks(
          sendToOnOfficeData as IApiIntSetPropPubLinksReq
        );
      }
    }

    const errorMessage = "Falscher Exporttyp wurde angegeben!";
    toastError(errorMessage);
    console.error(errorMessage);
    throw new Error(errorMessage);
  };

  return { fetchAvailOnOfficeStatuses, handleOnOfficeSync, sendToOnOffice };
};
