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
    { snapshotId, snapshotRes, ...fetchLocDescParams }: TFetchLocDescParams,
  ): Promise<string> {
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

    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getLocDescQuery(user, {
        snapshotRes: resultSnapshotRes,
        ...fetchLocDescParams,
      }),
    );
  }

  async fetchLocRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      realEstateId,
      realEstate,
      snapshotId,
      snapshotRes,
      ...fetchLocRealEstDescParams
    }: TFetchLocRealEstDescParams,
  ): Promise<string> {
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

    return this.openAiApiService.fetchResponse(
      await this.openAiQueryService.getLocRealEstDescQuery(user, {
        realEstate: resultRealEstate,
        snapshotRes: resultSnapshotRes,
        ...fetchLocRealEstDescParams,
      }),
    );
  }

  async fetchRealEstDesc(
    user: UserDocument | TIntegrationUserDocument,
    {
      realEstateId,
      realEstate,
      ...fetchRealEstDescParams
    }: TFetchRealEstDescParams,
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
        ...fetchRealEstDescParams,
      }),
    );
  }

  fetchFormToInform(formalText: string): Promise<string> {
    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getFormToInformQuery(formalText),
    );
  }

  fetchImprovedText(originalText: string, customText: string): Promise<string> {
    return this.openAiApiService.fetchResponse(
      this.openAiQueryService.getImprovedText(originalText, customText),
    );
  }

  async batchFetchLocDescs(
    user: UserDocument | TIntegrationUserDocument,
    fetchLocRealEstDescParams: TFetchLocRealEstDescParams,
  ): Promise<Record<TOpenAiLocDescType, string>> {
    const [locDesc, locRealEstDesc, realEstDesc] = await Promise.all([
      this.fetchLocDesc(user, fetchLocRealEstDescParams),
      this.fetchLocRealEstDesc(user, fetchLocRealEstDescParams),
      this.fetchRealEstDesc(user, fetchLocRealEstDescParams),
    ]);

    return {
      [OpenAiQueryTypeEnum.LOCATION_DESCRIPTION]: locDesc,
      [OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION]: locRealEstDesc,
      [OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION]: realEstDesc,
    };
  }
}
