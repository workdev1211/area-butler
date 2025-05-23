import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { UserDocument } from '../user/schema/user.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import {
  ILocDescQueryParams,
  ILocRealEstDescQueryParams,
  IRealEstDescQueryParams,
  OpenAiQueryService,
} from './open-ai-query.service';
import {
  IApiOpenAiLocDescQuery,
  IApiOpenAiLocRealEstDescQuery,
  IApiOpenAiRealEstDescQuery,
  OpenAiQueryTypeEnum,
  OpenAiTextLengthEnum,
  TOpenAiLocDescType,
} from '@area-butler-types/open-ai';
import { FetchSnapshotService } from '../location/fetch-snapshot.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { OpenAiApiService } from '../client/open-ai/open-ai-api.service';
import { PropstackApiService } from '../client/propstack/propstack-api.service';
import { LanguageTypeEnum } from '@area-butler-types/types';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import { TGeneralImage } from '../shared/types/shared';
import { ApiOnOfficeFileTypesEnum } from '@area-butler-types/on-office';
import { OpenAiOnOfficeService } from './open-ai-on-office.service';

type TFetchLocDescParams =
  | (IApiOpenAiLocDescQuery & { snapshotRes?: never })
  | (ILocDescQueryParams & { snapshotId?: never });

export type TFetchLocRealEstDescParams =
  | (IApiOpenAiLocRealEstDescQuery & {
      realEstate?: never;
      snapshotRes?: never;
    })
  | (ILocRealEstDescQueryParams & { realEstateId?: never; snapshotId?: never });

type TFetchRealEstDescParams =
  | (IApiOpenAiRealEstDescQuery & { realEstate?: never })
  | (IRealEstDescQueryParams & { realEstateId?: never });

@Injectable()
export class OpenAiService {
  constructor(
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly openAiApiService: OpenAiApiService,
    private readonly propstackApiService: PropstackApiService,
    private readonly openAiQueryService: OpenAiQueryService,
    private readonly openAiOnOfficeService: OpenAiOnOfficeService,
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  async fetchLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    const params = await this.processLocParams(user, locDescParams);
    const language =
      params.language ||
      params.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getLocDescQuery(user, params),
      locDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: locDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async fetchLocRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescParams: TFetchLocRealEstDescParams,
  ): Promise<string> {
    const params = await this.processLocRealEstParams(
      user,
      locRealEstDescParams,
    );
    const language =
      params.language ||
      params.snapshotRes.config.language ||
      LanguageTypeEnum.de;

    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getLocRealEstDescQuery(user, params),
      locRealEstDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: locRealEstDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async fetchRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    { realEstateId, realEstate, ...realEstDescParams }: TFetchRealEstDescParams,
  ): Promise<string> {
    const resultRealEstate =
      realEstate ||
      mapRealEstateListingToApiRealEstateListing(
        user,
        await this.realEstateListingService.fetchById(user, realEstateId),
      );
    const language = realEstDescParams.language || LanguageTypeEnum.de;

    if (!resultRealEstate) {
      throw new UnprocessableEntityException('Real estate not found!');
    }

    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getRealEstDescQuery({
        realEstate: resultRealEstate,
        ...realEstDescParams,
      }),
      realEstDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: realEstDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async fetchRealEstDesc2(
    user: TIntegrationUserDocument,
    { realEstateId, realEstate, ...realEstDescParams }: TFetchRealEstDescParams,
  ): Promise<string> {
    const resultRealEstate =
      realEstate ||
      mapRealEstateListingToApiRealEstateListing(
        user,
        await this.realEstateListingService.fetchById(user, realEstateId),
      );

    if (!resultRealEstate || !resultRealEstate.integrationId) {
      throw new UnprocessableEntityException('Real estate not found!');
    }
    const language = realEstDescParams.language || LanguageTypeEnum.de;

    const images = await this.getRealEstatePhotos(
      user,
      resultRealEstate.integrationId,
    );

    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getRealEstDescQuery({
        realEstate: resultRealEstate,
        images,
        ...realEstDescParams,
      }),
      realEstDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: realEstDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
      images,
    );
  }

  async fetchEquipmentDesc(
    user: TIntegrationUserDocument,
    { realEstateId, realEstate, ...realEstDescParams }: TFetchRealEstDescParams,
  ): Promise<string> {
    const resultRealEstate =
      realEstate ||
      mapRealEstateListingToApiRealEstateListing(
        user,
        await this.realEstateListingService.fetchById(user, realEstateId),
      );

    if (!resultRealEstate || !resultRealEstate.integrationId) {
      throw new UnprocessableEntityException('Real estate not found!');
    }

    const language = realEstDescParams.language || LanguageTypeEnum.de;

    const images = await this.getRealEstatePhotos(
      user,
      resultRealEstate.integrationId,
    );

    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getEquipmentDescQuery({
        realEstate: resultRealEstate,
        images,
        ...realEstDescParams,
      }),
      realEstDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: realEstDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
      images,
    );
  }

  fetchImprovedText(originalText: string, customText: string): Promise<string> {
    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getImprovedText(originalText, customText),
    );
  }

  fetchFormToInform(formalText: string): Promise<string> {
    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getFormToInformQuery(formalText),
    );
  }

  async fetchFacebookPost(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescParams: TFetchLocRealEstDescParams,
  ): Promise<string> {
    const params = await this.processLocRealEstParams(
      user,
      locRealEstDescParams,
    );
    const language =
      params.language ||
      params.snapshotRes.config.language ||
      LanguageTypeEnum.de;
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getFacebookPostQuery(user, params),
      locRealEstDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: locRealEstDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async fetchInstagramCaption(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescParams: TFetchLocRealEstDescParams,
  ): Promise<string> {
    const params = await this.processLocRealEstParams(
      user,
      locRealEstDescParams,
    );
    const language =
      params.language ||
      params.snapshotRes.config.language ||
      LanguageTypeEnum.de;
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getInstagramCaptionQuery(user, params),
      locRealEstDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: locRealEstDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async fetchMacroLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    const params = await this.processLocParams(user, locDescParams);
    const language =
      params.language ||
      params.snapshotRes.config.language ||
      LanguageTypeEnum.de;
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getMacroLocDescQuery(user, params),
      locDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: locDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async fetchMicroLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    const params = await this.processLocParams(user, locDescParams);
    const language =
      params.language ||
      params.snapshotRes.config.language ||
      LanguageTypeEnum.de;
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getMicroLocDescQuery(user, params),
      locDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: locDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async fetchDistrictDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    const params = await this.processLocParams(user, locDescParams);
    const language =
      params.language ||
      params.snapshotRes.config.language ||
      LanguageTypeEnum.de;
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getDistrictDescQuery(user, params),
      locDescParams.textLength === OpenAiTextLengthEnum.SPECIFIC && {
        maxCharactersLength: locDescParams.maxCharactersLength,
        language: language as LanguageTypeEnum,
      },
    );
  }

  async batchFetchLocDescs(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescParams: TFetchLocRealEstDescParams,
    requiredLocDescTypes: Map<TOpenAiLocDescType, TFetchLocRealEstDescParams>,
  ): Promise<Partial<Record<TOpenAiLocDescType, string>>> {
    const locDescMethods = {
      [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: async () => ({
        locDescType: OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        description: await this.fetchLocDesc(
          user,
          requiredLocDescTypes.get(OpenAiQueryTypeEnum.LOCATION_DESCRIPTION) ||
            locRealEstDescParams,
        ),
      }),
      [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: async () => ({
        locDescType: OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
        description: await this.fetchLocRealEstDesc(
          user,
          requiredLocDescTypes.get(
            OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
          ) || locRealEstDescParams,
        ),
      }),
      [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: async () => ({
        locDescType: OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        description: await this.fetchRealEstDesc(
          user,
          requiredLocDescTypes.get(
            OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
          ) || locRealEstDescParams,
        ),
      }),
      [OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION]: async () => ({
        locDescType: OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
        description: await this.fetchEquipmentDesc(
          user as TIntegrationUserDocument,
          requiredLocDescTypes.get(
            OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
          ) || locRealEstDescParams,
        ),
      }),
    };

    const resLocDescMethods = [...requiredLocDescTypes.keys()].map(
      (locDescType) => ({
        locDescMethod: locDescMethods[locDescType],
      }),
    );

    return (
      await Promise.all(
        resLocDescMethods.map(({ locDescMethod }) => locDescMethod()),
      )
    ).reduce((result, { locDescType, description }) => {
      result[locDescType] = description;
      return result;
    }, {});
  }

  private async processLocParams(
    user: UserDocument | TIntegrationUserDocument,
    { snapshotId, snapshotRes, ...locDescParams }: TFetchLocDescParams,
  ): Promise<ILocDescQueryParams> {
    const resultSnapshotRes =
      snapshotRes ||
      (await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
        user,
        snapshotId,
        false,
      ));

    if (!resultSnapshotRes) {
      throw new UnprocessableEntityException('Snapshot not found!');
    }

    return {
      snapshotRes: resultSnapshotRes,
      ...locDescParams,
    };
  }

  private async processLocRealEstParams(
    user: UserDocument | TIntegrationUserDocument,
    {
      realEstate,
      realEstateId,
      snapshotId,
      snapshotRes,
      ...locRealEstDescParams
    }: TFetchLocRealEstDescParams,
  ): Promise<ILocRealEstDescQueryParams> {
    const resultSnapshotRes =
      snapshotRes ||
      (await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
        user,
        snapshotId,
      ));

    if (!resultSnapshotRes) {
      throw new UnprocessableEntityException('Snapshot not found!');
    }

    const resultRealEstate =
      realEstate ||
      resultSnapshotRes.realEstate ||
      mapRealEstateListingToApiRealEstateListing(
        user,
        await this.realEstateListingService.fetchById(user, realEstateId),
      );

    if (!resultRealEstate) {
      throw new UnprocessableEntityException('Real estate not found!');
    }

    return {
      realEstate: resultRealEstate,
      snapshotRes: resultSnapshotRes,
      ...locRealEstDescParams,
    };
  }

  private async getRealEstatePhotos(
    user: TIntegrationUserDocument,
    estateId: string,
  ): Promise<TGeneralImage[]> {
    switch (user.integrationType) {
      case IntegrationTypesEnum.PROPSTACK:
        const {
          parameters: { apiKey },
        } = user;

        const realEstateExtData =
          await this.propstackApiService.fetchPropertyById(
            apiKey,
            Number(estateId),
          );

        return realEstateExtData.images.reduce((res, image) => {
          if (!image.is_not_for_expose) {
            res.push({ id: image.id, url: image.big_url, title: image.title });
          }
          return res;
        }, []);

      case IntegrationTypesEnum.ON_OFFICE:
        const images = await this.openAiOnOfficeService.fetchEstateImages(
          user,
          estateId,
        );

        return images.filter((image) =>
          [
            ApiOnOfficeFileTypesEnum.photo,
            ApiOnOfficeFileTypesEnum.cover,
            ApiOnOfficeFileTypesEnum.energyPassScale,
            ApiOnOfficeFileTypesEnum.floorPlan,
          ].includes(image.type),
        );
      default:
        return [];
    }
  }
}
