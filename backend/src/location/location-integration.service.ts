import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

@Injectable()
export class LocationIntegrationService {
  constructor(
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
  ) {}

  async fetchLatestSnapByIntId(
    integrationId: string,
    {
      integrationUserId,
      integrationType: userIntegrationType,
    }: TIntegrationUserDocument,
    integrationType?: IntegrationTypesEnum,
  ): Promise<SearchResultSnapshotDocument> {
    const a1 = await this.searchResultSnapshotModel
      .findOne({
        integrationParams: {
          integrationId,
          integrationUserId,
          integrationType: integrationType || userIntegrationType,
        },
      })
      .sort({ createdAt: -1 });

    return this.searchResultSnapshotModel
      .findOne({
        integrationParams: {
          integrationId,
          integrationUserId,
          integrationType: integrationType || userIntegrationType,
        },
      })
      .sort({ createdAt: -1 });
  }
}
