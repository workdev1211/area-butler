import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';

import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotConfig,
  ApiSearchResultSnapshotResponse,
} from '@area-butler-types/types';
import { defaultSnapshotConfig } from '../../../shared/constants/location';
import { LocationService } from './location.service';
import { IntegrationUserService } from '../user/integration-user.service';

@Injectable()
export class LocationIntService {
  constructor(
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly integrationUserService: IntegrationUserService,
    private readonly locationService: LocationService,
  ) {}

  async createSnapshot(
    integrationUser: TIntegrationUserDocument,
    snapshot: ApiSearchResultSnapshot,
    config?: ApiSearchResultSnapshotConfig,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const token = randomBytes(60).toString('hex');

    const mapboxAccessToken = (
      await this.integrationUserService.createMapboxAccessToken(integrationUser)
    ).config.mapboxAccessToken;

    let snapshotConfig = config;

    if (!snapshotConfig) {
      let templateSnapshot: SearchResultSnapshotDocument;
      const userTemplateId = integrationUser.config.templateSnapshotId;
      let parentUser;
      let parentTemplateId;

      if (!userTemplateId && integrationUser.parentId) {
        parentUser = await this.integrationUserService.findByDbId(
          integrationUser.parentId,
          { 'config.templateSnapshotId': 1 },
        );

        parentTemplateId = parentUser?.config.templateSnapshotId;
      }

      const templateSnapshotId = userTemplateId || parentTemplateId;

      if (templateSnapshotId) {
        templateSnapshot = await this.locationService.fetchSnapshot({
          user: userTemplateId ? integrationUser : parentUser,
          filterParams: { _id: new Types.ObjectId(templateSnapshotId) },
          projectParams: { config: 1 },
        });
      }

      if (!templateSnapshot) {
        templateSnapshot = await this.locationService.fetchSnapshot({
          user: integrationUser,
          projectParams: { config: 1 },
          sortParams: { updatedAt: -1 },
        });
      }

      snapshotConfig = templateSnapshot?.config || defaultSnapshotConfig;
    }

    // because of the different transportation params in the new snapshot and the template one
    snapshotConfig.defaultActiveMeans = snapshot.transportationParams.map(
      ({ type }) => type,
    );

    const snapshotDoc: Partial<SearchResultSnapshotDocument> = {
      mapboxAccessToken,
      snapshot,
      token,
      config: snapshotConfig,
    };

    snapshotDoc.integrationParams = {
      integrationUserId: integrationUser.integrationUserId,
      integrationType: integrationUser.integrationType,
      integrationId: snapshot.integrationId,
    };

    const savedSnapshotDoc = await new this.searchResultSnapshotModel(
      snapshotDoc,
    ).save();

    return {
      mapboxAccessToken,
      token,
      snapshot,
      id: savedSnapshotDoc.id,
      config: snapshotConfig,
      createdAt: savedSnapshotDoc.createdAt,
      endsAt: savedSnapshotDoc.endsAt,
    };
  }

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
