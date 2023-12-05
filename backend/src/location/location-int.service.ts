import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationTypesEnum } from '@area-butler-types/integration';

@Injectable()
export class LocationIntService {
  private readonly logger = new Logger(LocationIntService.name);

  constructor(
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
  ) {}

  // TODO refactor snapshot methods

  async fetchLatestSnapByIntId(
    {
      integrationUserId,
      integrationType: userIntegrationType,
    }: TIntegrationUserDocument,
    integrationId: string,
    integrationType?: IntegrationTypesEnum,
  ): Promise<SearchResultSnapshotDocument> {
    return this.searchResultSnapshotModel
      .findOne({
        'integrationParams.integrationId': integrationId,
        'integrationParams.integrationUserId': integrationUserId,
        'integrationParams.integrationType':
          integrationType || userIntegrationType,
      })
      .sort({ createdAt: -1 });
  }

  async deleteSnapshot(
    integrationUser: TIntegrationUserDocument,
    snapshotId: string,
  ): Promise<void> {
    const {
      integrationType,
      integrationUserId,
      config: { templateSnapshotId },
    } = integrationUser;

    if (templateSnapshotId === snapshotId) {
      integrationUser.set('config.templateSnapshotId', undefined);
      await integrationUser.save();
    }

    await this.searchResultSnapshotModel.deleteOne({
      _id: snapshotId,
      'integrationParams.integrationUserId': integrationUserId,
      'integrationParams.integrationType': integrationType,
    });
  }
}
