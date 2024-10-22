import { Injectable } from '@nestjs/common';

import { SnapshotExtService } from '../location/snapshot-ext.service';
import { IPerformLoginData, OnOfficeService } from './on-office.service';
import { OpenAiService } from '../open-ai/open-ai.service';
import {
  ApiSearchResultSnapshotResponse,
  AreaButlerExportTypesEnum,
  MeansOfTransportation,
} from '@area-butler-types/types';
import { onOfficeOpenAiFieldMapper } from '../../../shared/constants/on-office/on-office-constants';
import { OnOfficeOpenAiFieldEnum } from '@area-butler-types/on-office';
import { TOpenAiLocDescType } from '@area-butler-types/open-ai';
import { defaultRealEstType } from '../../../shared/constants/open-ai';
import { OpenAiExtService } from '../open-ai/open-ai-ext.service';
import { OnOfficeWebhookUrlEnum } from './shared/on-office.types';
import ApiOnOfficeLoginQueryParamsDto from './dto/api-on-office-login-query-params.dto';
import { TUpdEstTextFieldParams } from '@area-butler-types/integration';
import { createDirectLink } from '../shared/functions/shared';
import { OnOfficeEstateService } from './on-office-estate.service';

@Injectable()
export class OnOfficeWebhookService {
  constructor(
    private readonly onOfficeEstateService: OnOfficeEstateService,
    private readonly onOfficeService: OnOfficeService,
    private readonly openAiExtService: OpenAiExtService,
    private readonly openAiService: OpenAiService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {}

  async handleWebhook(
    endpoint: OnOfficeWebhookUrlEnum,
    onOfficeQueryParams: ApiOnOfficeLoginQueryParamsDto,
  ): Promise<void> {
    const { integrationUser, onOfficeEstate, place, realEstate } =
      await this.onOfficeService.performLogin(onOfficeQueryParams);

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
      locDescs = await this.generateLocDescs(
        {
          integrationUser,
          onOfficeEstate,
          place,
          realEstate,
        },
        snapshotRes,
      );
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
  }: Omit<
    IPerformLoginData,
    'onOfficeEstate'
  >): Promise<ApiSearchResultSnapshotResponse> {
    return this.snapshotExtService.createSnapshotByPlace({
      place,
      realEstateListing: realEstate,
      user: integrationUser,
    });
  }

  private async generateLocDescs(
    {
      integrationUser,
      onOfficeEstate: { lage, sonstige_angaben, objektbeschreibung },
      place,
      realEstate,
    }: IPerformLoginData,
    snapshotRes?: ApiSearchResultSnapshotResponse,
  ): Promise<Partial<Record<TOpenAiLocDescType, string>>> {
    const requiredLocDescTypes = Object.entries({
      lage,
      sonstige_angaben,
      objektbeschreibung,
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
      (await this.openAiExtService.generateSnapshotRes({ place }));

    return this.openAiService.batchFetchLocDescs(
      integrationUser,
      {
        realEstate,
        meanOfTransportation: MeansOfTransportation.WALK,
        realEstateType: realEstate.type || defaultRealEstType,
        snapshotRes: resultSnapshotRes,
      },
      requiredLocDescTypes,
    );
  }
}
