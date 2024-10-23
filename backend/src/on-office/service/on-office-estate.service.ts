import {
  HttpException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { plainToInstance } from 'class-transformer';

import { estateFields } from '../shared/on-office.constants';
import { OnOfficeApiService } from '../../client/on-office/on-office-api.service';
import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeArtTypesEnum,
  ApiOnOfficeResourceTypesEnum,
  IApiOnOfficeRealEstate,
  IApiOnOfficeRequest,
  IApiOnOfficeResponse,
  OnOfficeOpenAiFieldEnum,
  OnOfficeReqModuleEnum,
} from '@area-butler-types/on-office';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import {
  IApiIntCreateEstateLinkReq,
  IApiIntSetPropPubLinksReq,
  IApiIntUploadEstateFileReq,
  IApiRealEstAvailIntStatuses,
  IntegrationTypesEnum,
  TUpdEstTextFieldParams,
} from '@area-butler-types/integration';
import { GeoJsonPoint } from '../../shared/types/geo-json';
import { RealEstateListingIntService } from '../../real-estate-listing/real-estate-listing-int.service';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import { IApiIntUserOnOfficeParams } from '@area-butler-types/integration-user';
import {
  onOfficeLinkFieldMapper,
  onOfficeOpenAiFieldMapper,
} from '../../../../shared/constants/on-office/on-office-constants';
import ApiOnOfficeToAreaButlerDto from '../../real-estate-listing/dto/api-on-office-to-area-butler.dto';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { parseOnOfficeFloat } from '../../shared/functions/on-office';
import { PlaceService } from '../../place/place.service';
import { AreaButlerExportTypesEnum } from '@area-butler-types/types';
import { OpenAiQueryTypeEnum } from '@area-butler-types/open-ai';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';

interface IProcessEstateData {
  onOfficeEstate: IApiOnOfficeRealEstate;
  place: GeocodeResult;
  realEstate: ApiRealEstateListing;
}

@Injectable()
export class OnOfficeEstateService {
  private readonly integrationType = IntegrationTypesEnum.ON_OFFICE;
  private readonly logger = new Logger(OnOfficeEstateService.name);

  constructor(
    private readonly onOfficeApiService: OnOfficeApiService,
    private readonly placeService: PlaceService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
  ) {}

  async updateTextFields(
    { parameters, company: { config } }: TIntegrationUserDocument,
    integrationId: string,
    textFieldsParams: TUpdEstTextFieldParams[],
  ): Promise<void> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.MODIFY;
    const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
    const timestamp = dayjs().unix();

    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const defaultMaxTextLength = 2000;
    const resExportMatching = config?.exportMatching;

    const processTextFieldParams = ({
      exportType,
      text,
    }: TUpdEstTextFieldParams) => {
      let exportMatchParams =
        resExportMatching && resExportMatching[exportType];

      if (exportMatchParams?.fieldId === null) {
        return;
      }

      if (!exportMatchParams) {
        switch (exportType) {
          case AreaButlerExportTypesEnum.LINK_WITH_ADDRESS:
          case AreaButlerExportTypesEnum.LINK_WO_ADDRESS: {
            exportMatchParams = {
              fieldId: onOfficeLinkFieldMapper[exportType],
            };
            break;
          }

          case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
          case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
          case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
            exportMatchParams = {
              fieldId: onOfficeOpenAiFieldMapper.get(exportType),
              maxTextLength: defaultMaxTextLength,
            };
            break;
          }

          default: {
            throw new UnprocessableEntityException(
              'Could not determine the field id!',
            );
          }
        }
      }

      const processedText =
        exportMatchParams.maxTextLength === 0
          ? text
          : text.slice(
              0,
              exportMatchParams.maxTextLength || defaultMaxTextLength,
            );

      return { [exportMatchParams.fieldId]: processedText };
    };

    const data = textFieldsParams.reduce((result, textFieldParams) => {
      Object.assign(result, processTextFieldParams(textFieldParams));
      return result;
    }, {});

    if (!Object.keys(data).length) {
      return;
    }

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: integrationId,
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              data,
              extendedclaim: extendedClaim,
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.updateTextFields.name,
      'Estate update failed!',
      request,
      response,
    );
  }

  async uploadFile(
    { parameters, company: { config } }: TIntegrationUserDocument,
    {
      base64Image,
      exportType,
      filename,
      fileTitle,
      integrationId,
    }: IApiIntUploadEstateFileReq,
  ): Promise<void> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UPLOAD_FILE;

    const timestamp = dayjs().unix();
    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const initialRequest: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: null,
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              extendedclaim: extendedClaim,
              data: base64Image.replace(/^data:.*;base64,/, ''),
            },
          },
        ],
      },
    };

    const initialResponse = await this.onOfficeApiService.sendRequest(
      initialRequest,
    );

    this.onOfficeApiService.checkResponseIsSuccess(
      this.uploadFile.name,
      'File upload failed on the 1st step!',
      initialRequest,
      initialResponse,
    );

    let artType = ApiOnOfficeArtTypesEnum.FOTO;

    if (exportType === AreaButlerExportTypesEnum.QR_CODE) {
      artType = ApiOnOfficeArtTypesEnum['QR-CODE'];
    }
    if (exportType === AreaButlerExportTypesEnum.SCREENSHOT) {
      artType = ApiOnOfficeArtTypesEnum.LAGEPLAN;
    }

    const finalRequest: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: null,
            resourcetype: resourceType,
            identifier: '',
            parameters: {
              extendedclaim: extendedClaim,
              module: OnOfficeReqModuleEnum.ESTATE,
              tmpUploadId:
                initialResponse.response.results[0].data.records[0].elements
                  .tmpUploadId,
              file: filename,
              title: fileTitle,
              Art: artType,
              setDefaultPublicationRights: true,
              relatedRecordId: integrationId,
            },
          },
        ],
      },
    };

    const exportMatching = config?.exportMatching;

    if (exportMatching && exportMatching[exportType]) {
      finalRequest.request.actions[0].parameters.documentAttribute =
        exportMatching[exportType].fieldId;
    }

    const finalResponse = await this.onOfficeApiService.sendRequest(
      finalRequest,
    );

    this.onOfficeApiService.checkResponseIsSuccess(
      this.uploadFile.name,
      'File upload failed on the 2nd step!',
      finalRequest,
      finalResponse,
    );
  }

  async createLink(
    { parameters }: TIntegrationUserDocument,
    {
      integrationId,
      title,
      url,
    }: Omit<IApiIntCreateEstateLinkReq, 'exportType'>,
  ): Promise<void> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.DO;
    const resourceType = ApiOnOfficeResourceTypesEnum.UPLOAD_FILE;

    const timestamp = dayjs().unix();
    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const artType = ApiOnOfficeArtTypesEnum.LINK;

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: null,
            resourcetype: resourceType,
            identifier: '',
            parameters: {
              title,
              url,
              extendedclaim: extendedClaim,
              module: OnOfficeReqModuleEnum.ESTATE,
              Art: artType,
              relatedRecordId: integrationId,
            },
          },
        ],
      },
    };

    // TODO should be verified or removed in the future
    // if (exportMatching && exportMatching[exportType]) {
    //   request.request.actions[0].parameters.documentAttribute =
    //     exportMatching[exportType].fieldId;
    // }

    const response = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.createLink.name,
      'Link upload failed!',
      request,
      response,
    );
  }

  async fetchAvailStatuses({
    parameters,
  }: TIntegrationUserDocument): Promise<IApiRealEstAvailIntStatuses> {
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.GET;
    const resourceType = ApiOnOfficeResourceTypesEnum.FIELDS;

    const timestamp = dayjs().unix();
    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: '',
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              extendedclaim: extendedClaim,
              labels: true,
              language: 'DEU',
              modules: ['estate'],
              fieldList: ['vermarktungsart', 'status2'],
            },
          },
        ],
      },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.fetchAvailStatuses.name,
      'Link upload failed!',
      request,
      response,
    );

    const estateStatuses =
      response.response.results[0].data.records[0].elements?.status2
        .permittedvalues;

    const estateMarketTypes =
      response.response.results[0].data.records[0].elements?.vermarktungsart
        .permittedvalues;

    return {
      estateStatuses: estateStatuses
        ? Object.keys(estateStatuses).map((key) => ({
            text: estateStatuses[key],
            value: key,
          }))
        : undefined,
      estateMarketTypes: estateMarketTypes
        ? Object.keys(estateMarketTypes).map((key) => ({
            text: estateMarketTypes[key],
            value: key,
          }))
        : undefined,
    };
  }

  async setPublicLinks(
    integrationUser: TIntegrationUserDocument,
    { integrationId, publicLinkParams }: IApiIntSetPropPubLinksReq,
  ): Promise<void> {
    const textFieldsParams: TUpdEstTextFieldParams[] = [];

    for (const { exportType, isLinkEntity, title, url } of publicLinkParams) {
      if (isLinkEntity) {
        await this.createLink(integrationUser, {
          integrationId,
          title,
          url,
        });

        continue;
      }

      textFieldsParams.push({
        exportType,
        text: url,
      });
    }

    if (textFieldsParams.length) {
      await this.updateTextFields(
        integrationUser,
        integrationId,
        textFieldsParams,
      );
    }
  }

  async processData(
    integrationUser: TIntegrationUserDocument,
    estateId: string,
  ): Promise<IProcessEstateData> {
    const { integrationUserId, parameters } = integrationUser;
    const { token, apiKey, extendedClaim } =
      parameters as IApiIntUserOnOfficeParams;
    const actionId = ApiOnOfficeActionIdsEnum.READ;
    const resourceType = ApiOnOfficeResourceTypesEnum.ESTATE;
    const timestamp = dayjs().unix();

    const signature = this.onOfficeApiService.generateSignature(
      [timestamp, token, resourceType, actionId].join(''),
      apiKey,
      'base64',
    );

    const request: IApiOnOfficeRequest = {
      token,
      request: {
        actions: [
          {
            timestamp,
            hmac: signature,
            hmac_version: 2,
            actionid: actionId,
            resourceid: estateId,
            identifier: '',
            resourcetype: resourceType,
            parameters: {
              data: [
                ...estateFields,
                ...Object.values(OnOfficeOpenAiFieldEnum),
              ],
              extendedclaim: extendedClaim,
              formatoutput: true,
            },
          },
        ],
      },
    };

    const response: IApiOnOfficeResponse<IApiOnOfficeRealEstate> =
      await this.onOfficeApiService.sendRequest(request);

    this.onOfficeApiService.checkResponseIsSuccess(
      this.processData.name,
      'The estate entity has not been retrieved!',
      request,
      response,
    );

    const onOfficeEstate =
      response.response.results[0].data.records[0].elements;

    const {
      breitengrad: lat,
      laengengrad: lng,
      strasse: street,
      hausnummer: houseNumber,
      plz: zipCode,
      ort: city,
      land: country,
    } = onOfficeEstate;

    let locationAddress = `${street} ${houseNumber}, ${zipCode} ${city}, ${country}`;

    const locationCoordinates = {
      lat: parseOnOfficeFloat(lat),
      lng: parseOnOfficeFloat(lng),
    };

    let place = await this.placeService.fetchPlace({
      location: locationAddress,
      user: integrationUser,
    });

    if (!place) {
      locationAddress = undefined;

      place = await this.placeService.fetchPlace({
        location: locationCoordinates,
        user: integrationUser,
      });
    }

    if (!place) {
      this.logger.error(
        this.processData.name,
        locationAddress,
        locationCoordinates,
      );

      throw new HttpException('Adresse nicht gefunden!', 400); // Address is not found
    }

    Object.assign(onOfficeEstate, {
      integrationParams: {
        integrationUserId,
        integrationId: estateId,
        integrationType: this.integrationType,
      },
      address: locationAddress || place.formatted_address,
      location: {
        type: 'Point',
        coordinates: [place.geometry.location.lat, place.geometry.location.lng],
      } as GeoJsonPoint,
    });

    const realEstate = mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.upsertOneByIntParams(
        plainToInstance(ApiOnOfficeToAreaButlerDto, onOfficeEstate, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }),
      ),
    );

    return {
      onOfficeEstate,
      place,
      realEstate,
    };
  }
}
