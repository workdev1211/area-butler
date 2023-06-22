import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

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
export class LocationIntegrationService {
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

    const latestSnapshot = (
      await this.locationService.fetchSnapshots(
        integrationUser,
        0,
        1,
        { iframeEndsAt: 1 },
        { updatedAt: -1, createdAt: -1 },
        { 'integrationParams.integrationId': snapshot.integrationId },
      )
    )[0];

    const { id, config, createdAt } =
      await this.searchResultSnapshotModel.create({
        mapboxAccessToken,
        snapshot,
        token,
        config: defaultSnapshotConfig,
        iframeEndsAt: latestSnapshot?.iframeEndsAt,
        integrationParams: {
          integrationId: snapshot.integrationId,
          integrationUserId: integrationUser.integrationUserId,
          integrationType: integrationUser.integrationType,
        },
      });

    return {
      id,
      token,
      mapboxAccessToken,
      snapshot,
      config,
      createdAt,
    };
  }

  // TODO remove in future
  // async setIframeDuration(
  //   integrationUser: TIntegrationUserDocument,
  //   snapshotId: string,
  // ): Promise<SearchResultSnapshotDocument> {
  //   return this.searchResultSnapshotModel.findByIdAndUpdate(
  //     snapshotId,
  //     { iframeEndsAt: dayjs().add(6, 'months').toDate() },
  //     { new: true },
  //   );
  // }
}
