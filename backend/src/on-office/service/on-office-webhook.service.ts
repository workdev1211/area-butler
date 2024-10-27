import { Injectable, Logger } from '@nestjs/common';

import { SnapshotExtService } from '../../location/snapshot-ext.service';
import { IPerformLoginData, OnOfficeService } from './on-office.service';
import { OpenAiService } from '../../open-ai/open-ai.service';
import {
  ApiSearchResultSnapshotResponse,
  AreaButlerExportTypesEnum,
  MeansOfTransportation,
} from '@area-butler-types/types';
import { onOfficeOpenAiFieldMapper } from '../../../../shared/constants/on-office/on-office-constants';
import { OnOfficeOpenAiFieldEnum } from '@area-butler-types/on-office';
import { TOpenAiLocDescType } from '@area-butler-types/open-ai';
import { defaultRealEstType } from '../../../../shared/constants/open-ai';
import { OpenAiExtService } from '../../open-ai/open-ai-ext.service';
import { OnOfficeWebhookUrlEnum } from '../shared/on-office.types';
import ApiOnOfficeLoginQueryParamsDto from '../dto/api-on-office-login-query-params.dto';
import { TUpdEstTextFieldParams } from '@area-butler-types/integration';
import { createDirectLink } from '../../shared/functions/shared';
import { OnOfficeEstateService } from './on-office-estate.service';
import { PotentialCustomerService } from '../../potential-customer/potential-customer.service';
import { PotentialCustomerDocument } from '../../potential-customer/schema/potential-customer.schema';
import { defaultPotentialCustomer } from '../../shared/constants/potential-customers';

interface IGenerateLocDescs {
  loginData: IPerformLoginData;
  snapshotRes?: ApiSearchResultSnapshotResponse;
  potentialCustomer?: Partial<PotentialCustomerDocument>;
}

@Injectable()
export class OnOfficeWebhookService {
  private readonly logger = new Logger(OnOfficeWebhookService.name);

  constructor(
    private readonly onOfficeEstateService: OnOfficeEstateService,
    private readonly onOfficeService: OnOfficeService,
    private readonly openAiExtService: OpenAiExtService,
    private readonly openAiService: OpenAiService,
    private readonly potentialCustomerService: PotentialCustomerService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {}

  async handleWebhook(
    endpoint: OnOfficeWebhookUrlEnum,
    onOfficeQueryParams: ApiOnOfficeLoginQueryParamsDto,
  ): Promise<void> {
    const { integrationUser, onOfficeEstate, place, realEstate } =
      await this.onOfficeService.performLogin(onOfficeQueryParams);

    if (!integrationUser.subscription) {
      this.logger.verbose(
        `User ${integrationUser.integrationUserId} doesn't have a subscription. Endpoint: ${endpoint}.`,
      );

      return;
    }

    let fetchPotentCustomer: PotentialCustomerDocument;

    if (onOfficeEstate.TargetAudience?.length) {
      fetchPotentCustomer = await this.potentialCustomerService.findOne(
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

    const potentialCustomer = fetchPotentCustomer || defaultPotentialCustomer;
    this.logger.verbose(
      `Potential customer is ${
        potentialCustomer?.id || potentialCustomer.name
      }.`,
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
        potentialCustomer,
        realEstate,
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
          realEstate,
        },
        potentialCustomer,
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
      await this.onOfficeEstateService.updateTextFields(
        integrationUser,
        realEstate.integrationId,
        textFieldParams,
      );
    }
  }

  private async createSnapshot({
    integrationUser,
    place,
    realEstate,
    potentialCustomer: {
      preferredLocations,
      preferredAmenities: poiTypes,
      routingProfiles: transportParams,
    },
  }: Omit<IPerformLoginData, 'onOfficeEstate'> & {
    potentialCustomer: Partial<PotentialCustomerDocument>;
  }): Promise<ApiSearchResultSnapshotResponse> {
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
    loginData: {
      integrationUser,
      place,
      realEstate,
      onOfficeEstate: { lage, objektbeschreibung, ausstatt_beschr },
    },
  }: IGenerateLocDescs): Promise<Partial<Record<TOpenAiLocDescType, string>>> {
    const requiredLocDescTypes = Object.entries({
      lage,
      objektbeschreibung,
      ausstatt_beschr,
    }).reduce<Set<TOpenAiLocDescType>>((result, [key, value]) => {
      const locDescType = onOfficeOpenAiFieldMapper.get(
        key as OnOfficeOpenAiFieldEnum,
      );

      if (locDescType && !value) {
        result.add(locDescType as TOpenAiLocDescType);
      }

      return result;
    }, new Set());

    const resultSnapshotRes =
      snapshotRes ||
      (await this.openAiExtService.generateSnapshotRes({
        place,
        potentialCustomer,
      }));

    return this.openAiService.batchFetchLocDescs(
      integrationUser,
      {
        realEstate,
        meanOfTransportation: MeansOfTransportation.WALK,
        realEstateType: realEstate.type || defaultRealEstType,
        snapshotRes: resultSnapshotRes,
        targetGroupName: potentialCustomer.name,
      },
      requiredLocDescTypes,
    );
  }
}
