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
  TOpenAiLocDescType,
} from '@area-butler-types/open-ai';
import { FetchSnapshotService } from '../location/fetch-snapshot.service';
import { mapRealEstateListingToApiRealEstateListing } from '../real-estate-listing/mapper/real-estate-listing.mapper';
import { RealEstateListingService } from '../real-estate-listing/real-estate-listing.service';
import { OpenAiApiService } from '../client/open-ai/open-ai-api.service';

type TFetchLocDescParams =
  | (IApiOpenAiLocDescQuery & { snapshotRes?: never })
  | (ILocDescQueryParams & { snapshotId?: never });

type TFetchLocRealEstDescParams =
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
    private readonly openAiQueryService: OpenAiQueryService,
    private readonly realEstateListingService: RealEstateListingService,
  ) {}

  async fetchLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getLocDescQuery(
        user,
        await this.processLocParams(user, locDescParams),
      ),
    );
  }

  async fetchLocRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescParams: TFetchLocRealEstDescParams,
  ): Promise<string> {
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getLocRealEstDescQuery(
        user,
        await this.processLocRealEstParams(user, locRealEstDescParams),
      ),
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

    if (!resultRealEstate) {
      throw new UnprocessableEntityException('Real estate not found!');
    }

    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getRealEstDescQuery({
        realEstate: resultRealEstate,
        ...realEstDescParams,
      }),
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
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getFacebookPostQuery(
        user,
        await this.processLocRealEstParams(user, locRealEstDescParams),
      ),
    );
  }

  async fetchInstagramCaption(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescParams: TFetchLocRealEstDescParams,
  ): Promise<string> {
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getInstagramCaptionQuery(
        user,
        await this.processLocRealEstParams(user, locRealEstDescParams),
      ),
    );
  }

  async fetchMacroLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getMacroLocDescQuery(
        user,
        await this.processLocParams(user, locDescParams),
      ),
    );
  }

  async fetchMicroLocDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getMicroLocDescQuery(
        user,
        await this.processLocParams(user, locDescParams),
      ),
    );
  }

  async fetchDistrictDesc(
    user: UserDocument | TIntegrationUserDocument,
    locDescParams: TFetchLocDescParams,
  ): Promise<string> {
    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getDistrictDescQuery(
        user,
        await this.processLocParams(user, locDescParams),
      ),
    );
  }

  async batchFetchLocDescs(
    user: UserDocument | TIntegrationUserDocument,
    locRealEstDescParams: TFetchLocRealEstDescParams,
    requiredLocDescTypes?: Set<TOpenAiLocDescType>,
  ): Promise<Partial<Record<TOpenAiLocDescType, string>>> {
    const locDescMethods = {
      [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: async () => ({
        locDescType: OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        description: await this.fetchLocDesc(user, locRealEstDescParams),
      }),
      [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: async () => ({
        locDescType: OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
        description: await this.fetchLocRealEstDesc(user, locRealEstDescParams),
      }),
      [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: async () => ({
        locDescType: OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        description: await this.fetchRealEstDesc(user, locRealEstDescParams),
      }),
    };

    const resLocDescMethods = requiredLocDescTypes
      ? [...requiredLocDescTypes].map(
          (locDescType) => locDescMethods[locDescType],
        )
      : Object.values(locDescMethods);

    return (
      await Promise.all(
        resLocDescMethods.map((locDescMethod) => locDescMethod()),
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
}
