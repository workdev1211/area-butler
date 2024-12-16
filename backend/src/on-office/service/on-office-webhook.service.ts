import { Injectable, Logger } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
import * as relativeTime from 'dayjs/plugin/relativeTime';

import { SnapshotExtService } from '../../location/snapshot-ext.service';
import { IPerformLoginData, OnOfficeService } from './on-office.service';
import {
  OpenAiService,
  TFetchLocRealEstDescParams,
} from '../../open-ai/open-ai.service';
import {
  ApiSearchResultSnapshotResponse,
  AreaButlerExportTypesEnum,
  MeansOfTransportation,
} from '@area-butler-types/types';
import {
  OpenAiQueryTypeEnum,
  TOpenAiLocDescType,
} from '@area-butler-types/open-ai';
import { defaultRealEstType } from '../../../../shared/constants/open-ai';
import { OpenAiExtService } from '../../open-ai/open-ai-ext.service';
import { OnOfficeWebhookUrlEnum } from '../shared/on-office.types';
import ApiOnOfficeLoginQueryParamsDto from '../dto/api-on-office-login-query-params.dto';
import {
  IntegrationActionTypeEnum,
  IntegrationTypesEnum,
  TUpdEstTextFieldParams,
} from '@area-butler-types/integration';
import { createDirectLink } from '../../shared/functions/shared';
import { PotentialCustomerService } from '../../potential-customer/potential-customer.service';
import { PotentialCustomerDocument } from '../../potential-customer/schema/potential-customer.schema';
import { defaultPotentialCustomer } from '../../shared/constants/potential-customers';
import { OnOfficeQueryBuilderService } from './query-builder/on-office-query-builder.service';
import { RealEstateListingIntService } from '../../real-estate-listing/real-estate-listing-int.service';
import { mapRealEstateListingToApiRealEstateListing } from '../../real-estate-listing/mapper/real-estate-listing.mapper';
import { TIntegrationUserDocument } from '../../user/schema/integration-user.schema';
import { ApiRealEstateListing } from '@area-butler-types/real-estate';
import { checkIsSearchNotUnlocked } from '../../../../shared/functions/integration.functions';
import { onOfficeOpenAiFieldMapper } from '../../../../shared/constants/on-office/on-office-constants';

dayjs.extend(duration);
dayjs.extend(relativeTime);

interface IGenerateLocDescs {
  loginData: IPerformLoginData;
  snapshotRes?: ApiSearchResultSnapshotResponse;
  potentialCustomer?: Partial<PotentialCustomerDocument>;
}

@Injectable()
export class OnOfficeWebhookService {
  private readonly logger = new Logger(OnOfficeWebhookService.name);

  constructor(
    private readonly onOfficeQueryBuilderService: OnOfficeQueryBuilderService,
    private readonly onOfficeService: OnOfficeService,
    private readonly openAiExtService: OpenAiExtService,
    private readonly openAiService: OpenAiService,
    private readonly potentialCustomerService: PotentialCustomerService,
    private readonly realEstateListingIntService: RealEstateListingIntService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {}

  async handleWebhook(
    endpoint: OnOfficeWebhookUrlEnum,
    onOfficeQueryParams: ApiOnOfficeLoginQueryParamsDto,
  ): Promise<void> {
    const nowDate = new Date();
    const eventId = `${endpoint}-${onOfficeQueryParams.customerWebId}-${
      onOfficeQueryParams.userId
    }-${onOfficeQueryParams.estateId}-${nowDate.getTime()}`;

    this.logger.verbose(`Webhook ${eventId} was triggered.`);

    const { integrationUser, onOfficeEstate, place, realEstate } =
      await this.onOfficeService.performLogin(onOfficeQueryParams);

    const resRealEstate = await this.getUnlockRealEst(
      integrationUser,
      endpoint,
      realEstate,
    );

    let fetchedPotCustomer: PotentialCustomerDocument;

    if (onOfficeEstate.TargetAudience?.length) {
      fetchedPotCustomer = await this.potentialCustomerService.findOne(
        integrationUser,
        { name: onOfficeEstate.TargetAudience[0] },
        {
          name: 1,
          routingProfiles: 1,
          preferredAmenities: 1,
          preferredLocations: 1,
        },
      );
    }

    this.logger.verbose(
      `Webhook ${eventId}. ${
        fetchedPotCustomer
          ? `Potential customer is ${fetchedPotCustomer.name} (id: ${fetchedPotCustomer.id}).`
          : 'Potential customer not found.'
      }`,
    );

    let snapshotRes: ApiSearchResultSnapshotResponse;
    let locDescs: Partial<Record<TOpenAiLocDescType, string>>;

    if (
      [
        OnOfficeWebhookUrlEnum.CREATE_MAP,
        OnOfficeWebhookUrlEnum.CREATE_LOC_DESCS_MAP,
        OnOfficeWebhookUrlEnum.TARGET_GROUP,
      ].includes(endpoint)
    ) {
      snapshotRes = await this.createSnapshot({
        integrationUser,
        place,
        potentialCustomer: fetchedPotCustomer,
        realEstate: resRealEstate,
      });
    }

    if (
      [
        OnOfficeWebhookUrlEnum.CREATE_LOC_DESCS,
        OnOfficeWebhookUrlEnum.CREATE_LOC_DESCS_MAP,
        OnOfficeWebhookUrlEnum.TARGET_GROUP,
      ].includes(endpoint)
    ) {
      locDescs = await this.generateLocDescs({
        loginData: {
          integrationUser,
          onOfficeEstate,
          place,
          realEstate: resRealEstate,
        },
        potentialCustomer: fetchedPotCustomer,
        snapshotRes,
      });
    }

    const textFieldParams: TUpdEstTextFieldParams[] = [];

    if (snapshotRes) {
      textFieldParams.push(
        {
          exportType: AreaButlerExportTypesEnum.LINK_WITH_ADDRESS,
          text: createDirectLink(snapshotRes, true),
        },
        {
          exportType: AreaButlerExportTypesEnum.LINK_WO_ADDRESS,
          text: createDirectLink(snapshotRes, false),
        },
      );
    }

    if (locDescs) {
      textFieldParams.push(
        ...Object.entries(locDescs).map(([locDescType, locDesc]) => ({
          exportType: locDescType as TOpenAiLocDescType,
          text: locDesc,
        })),
      );
    }

    if (textFieldParams.length) {
      await this.onOfficeQueryBuilderService
        .setUser(integrationUser)
        .updateTextFields(
          resRealEstate.integrationId,
          textFieldParams,
          integrationUser.company.config.exportMatching,
        )
        .exec();
    }

    this.logger.verbose(
      `Webhook ${eventId} processing is complete and took ${dayjs
        .duration(dayjs().diff(dayjs(+eventId.match(/^.*?-(\d*)$/)[1])))
        .humanize()}.`,
    );
  }

  private async createSnapshot({
    integrationUser,
    place,
    realEstate,
    potentialCustomer,
  }: Omit<IPerformLoginData, 'onOfficeEstate'> & {
    potentialCustomer: Partial<PotentialCustomerDocument>;
  }): Promise<ApiSearchResultSnapshotResponse> {
    const {
      preferredLocations,
      preferredAmenities: poiTypes,
      routingProfiles: transportParams,
    } = potentialCustomer || defaultPotentialCustomer;

    return this.snapshotExtService.createSnapshotByPlace({
      place,
      poiTypes,
      preferredLocations,
      transportParams,
      realEstateListing: realEstate,
      user: integrationUser,
    });
  }

  private async generateLocDescs({
    potentialCustomer,
    snapshotRes,
    loginData: { integrationUser, place, realEstate, onOfficeEstate },
  }: IGenerateLocDescs): Promise<Partial<Record<TOpenAiLocDescType, string>>> {
    const resultSnapshotRes =
      snapshotRes ||
      (await this.openAiExtService.generateSnapshotRes({
        place,
        potentialCustomer: potentialCustomer || defaultPotentialCustomer,
      }));

    const defaultData = {
      realEstate,
      meanOfTransportation: MeansOfTransportation.WALK,
      realEstateType: realEstate.type || defaultRealEstType,
      snapshotRes: resultSnapshotRes,
      targetGroupName: potentialCustomer?.name,
    };

    const requiredLocDescTypes = (
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
      ] as TOpenAiLocDescType[]
    ).reduce((result, locDescType) => {
      const isValueSet =
        !!onOfficeEstate[
          integrationUser.company.config.exportMatching?.[locDescType]
            ?.fieldId || onOfficeOpenAiFieldMapper.get(locDescType)
        ];

      const preset: Partial<Record<string, any>> =
        integrationUser.company?.config?.presets?.[locDescType];

      if (locDescType && !isValueSet) {
        result.set(locDescType, {
          ...defaultData,
          ...preset?.general,
          ...preset?.locationDescription,
          ...preset?.realEstateDescription,
          realEstate: defaultData.realEstate,
          snapshot: defaultData.snapshotRes,
          targetGroupName:
            defaultData.targetGroupName ||
            preset?.general?.targetGroupName ||
            defaultPotentialCustomer.name,
        });
      }

      return result;
    }, new Map<TOpenAiLocDescType, TFetchLocRealEstDescParams>());

    return this.openAiService.batchFetchLocDescs(
      integrationUser,
      defaultData,
      requiredLocDescTypes,
    );
  }

  private async getUnlockRealEst(
    integrationUser: TIntegrationUserDocument,
    endpoint: OnOfficeWebhookUrlEnum,
    realEstate: ApiRealEstateListing,
  ): Promise<ApiRealEstateListing> {
    const actionType = [
      OnOfficeWebhookUrlEnum.CREATE_LOC_DESCS,
      OnOfficeWebhookUrlEnum.CREATE_LOC_DESCS_MAP,
      OnOfficeWebhookUrlEnum.TARGET_GROUP,
    ].includes(endpoint)
      ? IntegrationActionTypeEnum.UNLOCK_OPEN_AI
      : IntegrationActionTypeEnum.UNLOCK_SEARCH;

    const isUnlockNotNeeded =
      integrationUser.subscription ||
      (actionType === IntegrationActionTypeEnum.UNLOCK_OPEN_AI &&
        realEstate.openAiRequestQuantity) ||
      (actionType === IntegrationActionTypeEnum.UNLOCK_SEARCH &&
        checkIsSearchNotUnlocked(realEstate));

    if (isUnlockNotNeeded) {
      return realEstate;
    }

    const integrationId = realEstate.integrationId;

    await this.realEstateListingIntService.handleProductUnlock(
      integrationUser,
      { actionType, integrationId },
    );

    return mapRealEstateListingToApiRealEstateListing(
      integrationUser,
      await this.realEstateListingIntService.findOneOrFailByIntParams({
        integrationId,
        integrationUserId: integrationUser.integrationUserId,
        integrationType: IntegrationTypesEnum.ON_OFFICE,
      }),
    );
  }
}
