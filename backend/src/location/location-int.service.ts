import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import { TIntegrationUserDocument } from '../user/schema/integration-user.schema';
import { IntegrationTypesEnum } from '@area-butler-types/integration';
import {
  ApiSearchResultSnapshot,
  ApiSearchResultSnapshotResponse,
} from '@area-butler-types/types';
import { randomBytes } from 'crypto';
import { defaultSnapshotConfig } from '../../../shared/constants/location';
import { IntegrationUserService } from '../user/integration-user.service';
import { LocationService } from './location.service';

@Injectable()
export class LocationIntService {
  constructor(
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly integrationUserService: IntegrationUserService,
    private readonly locationService: LocationService,
  ) {}

  async fetchLatestSnapByIntId(
    integrationId: string,
    {
      integrationUserId,
      integrationType: userIntegrationType,
    }: TIntegrationUserDocument,
    integrationType?: IntegrationTypesEnum,
  ): Promise<SearchResultSnapshotDocument> {
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

  async createSnapshot(
    integrationUser: TIntegrationUserDocument,
    snapshot: ApiSearchResultSnapshot,
  ): Promise<ApiSearchResultSnapshotResponse> {
    const token = randomBytes(60).toString('hex');

    const mapboxAccessToken = (
      await this.integrationUserService.createMapboxAccessToken(integrationUser)
    ).config.mapboxAccessToken;

    const latestAccountSnapshot = (
      await this.locationService.fetchSnapshots(
        integrationUser,
        0,
        1,
        { config: 1 },
        { updatedAt: -1 },
      )
    )[0];

    const { id, config, createdAt } =
      await this.searchResultSnapshotModel.findOneAndUpdate(
        {
          'integrationParams.integrationId': snapshot.integrationId,
        },
        {
          mapboxAccessToken,
          snapshot,
          token,
          config: latestAccountSnapshot?.config || defaultSnapshotConfig,
          'integrationParams.integrationUserId':
            integrationUser.integrationUserId,
          'integrationParams.integrationType': integrationUser.integrationType,
        },
        { new: true, upsert: true, sort: { updatedAt: -1 } },
      );

    return {
      id,
      token,
      mapboxAccessToken,
      snapshot,
      config,
      createdAt,
    };
  }
}
