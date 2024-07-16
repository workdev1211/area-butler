import { HttpException, Injectable } from '@nestjs/common';

import { OverpassDataService } from '../data-provision/overpass-data/overpass-data.service';
import { configService } from '../config/config.service';
import {
  ApiCoordinates,
  ApiOsmEntity,
  ApiOsmLocation,
  ApiSearchResultSnapshotResponse,
  MeansOfTransportation,
  OsmName,
  PoiGroupEnum,
  TPoiGroupName,
  UnitsOfTransportation,
} from '@area-butler-types/types';
import { OverpassService } from '../client/overpass/overpass.service';
import {
  convertMetersToMinutes,
  convertMinutesToMeters,
} from '../../../shared/functions/shared.functions';
import {
  ApiUnitsOfTransportEnum,
  IApiFetchSnapshotDataReq,
  IApiFetchSnapshotDataRes,
  SnapshotDataTypesEnum,
} from '../shared/types/external-api';
import { IApiOverpassFetchNodes } from '@area-butler-types/overpass';
import { UserDocument } from '../user/schema/user.schema';
import { SnapshotExtService } from './snapshot-ext.service';
import { defaultPoiTypes } from '../../../shared/constants/location';
import {
  SearchResultSnapshot,
  SearchResultSnapshotDocument,
} from './schema/search-result-snapshot.schema';
import { createDirectLink } from '../shared/functions/shared';
import { FetchSnapshotService } from './fetch-snapshot.service';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionFields } from 'mongoose';
import { OsmEntityMapper } from '@area-butler-types/osm-entity-mapper';

interface IFetchPoiDataArgs {
  coordinates: ApiCoordinates;
  transportMode: MeansOfTransportation;
  distance: number;
  poiNumber?: number;
  unit: ApiUnitsOfTransportEnum;
  preferredAmenities?: OsmName[];
}

const MAX_DISTANCE_IN_METERS = 2000;

@Injectable()
export class LocationExtService {
  constructor(
    // TODO to be removed after poi migration
    @InjectModel(SearchResultSnapshot.name)
    private readonly searchResultSnapshotModel: Model<SearchResultSnapshotDocument>,
    private readonly fetchSnapshotService: FetchSnapshotService,
    private readonly overpassService: OverpassService,
    private readonly overpassDataService: OverpassDataService,
    private readonly snapshotExtService: SnapshotExtService,
  ) {}

  async fetchPoiData({
    coordinates,
    transportMode,
    distance,
    unit,
    poiNumber = 0,
    preferredAmenities = defaultPoiTypes,
  }: IFetchPoiDataArgs): Promise<ApiOsmLocation[]> {
    let resultDistInMeters = distance;
    let maxPossibleDistance;

    switch (unit) {
      case ApiUnitsOfTransportEnum.KILOMETERS: {
        resultDistInMeters = resultDistInMeters * 1000;
        maxPossibleDistance = MAX_DISTANCE_IN_METERS / 1000;
        break;
      }

      case ApiUnitsOfTransportEnum.METERS: {
        maxPossibleDistance = MAX_DISTANCE_IN_METERS;
        break;
      }

      case ApiUnitsOfTransportEnum.MINUTES: {
        resultDistInMeters = convertMinutesToMeters(
          resultDistInMeters,
          transportMode,
        );

        maxPossibleDistance = convertMetersToMinutes(
          MAX_DISTANCE_IN_METERS,
          transportMode,
        );
        break;
      }
    }

    if (resultDistInMeters > MAX_DISTANCE_IN_METERS) {
      throw new HttpException(
        `The distance shouldn't be higher than ${maxPossibleDistance} ${unit.toLowerCase()}!`,
        400,
      );
    }

    // TODO test the limit with direct Overpass calls
    const fetchNodeParams: IApiOverpassFetchNodes = {
      coordinates,
      preferredAmenities,
      distanceInMeters: resultDistInMeters,
    };

    return !!configService.useOverpassDb()
      ? await this.overpassDataService.findForCenterAndDistance({
          ...fetchNodeParams,
          limit: poiNumber,
        })
      : await this.overpassService.fetchNodes(fetchNodeParams);
  }

  async fetchSnapshotData(
    user: UserDocument,
    fetchSnapshotData: IApiFetchSnapshotDataReq,
  ): Promise<IApiFetchSnapshotDataRes> {
    const {
      address,
      distance,
      isAddressShown,
      lat,
      lng,
      markerColor,
      poiTypes,
      publicationId,
      responseType,
      snapshotId,
      templateSnapshotId,
      transportMode,
      unit,
    } = fetchSnapshotData;

    let snapshotResponse:
      | SearchResultSnapshotDocument
      | ApiSearchResultSnapshotResponse;

    if (snapshotId) {
      snapshotResponse =
        await this.fetchSnapshotService.fetchSnapshotByIdOrFail(
          user,
          snapshotId,
        );
    }

    if (!snapshotId) {
      let resultingDistance = distance;
      let resultingUnit = unit as unknown as UnitsOfTransportation;

      if (unit === ApiUnitsOfTransportEnum.METERS) {
        resultingUnit = UnitsOfTransportation.KILOMETERS;
        resultingDistance = resultingDistance / 1000;
      }

      snapshotResponse = await this.snapshotExtService.createSnapshot({
        user,
        location: address || { lat, lng },
        templateSnapshotId,
        transportParams: [
          {
            type: transportMode,
            amount: resultingDistance,
            unit: resultingUnit,
          },
        ],
        poiTypes,
        externalId: publicationId,
        primaryColor: markerColor,
      });
    }

    const responseData = {
      input: {
        coordinates: snapshotResponse.snapshot.location,
        address: snapshotResponse.snapshot.placesLocation?.label,
      },
      snapshotId: snapshotResponse.id,
    } as IApiFetchSnapshotDataRes;

    const directLink = createDirectLink(snapshotResponse, isAddressShown);

    switch (responseType) {
      case SnapshotDataTypesEnum.DIRECT_LINK: {
        responseData.result = directLink;
        return responseData;
      }

      case SnapshotDataTypesEnum.IFRAME_CODE: {
        const iframeCode = String.raw`
<iframe
 style="border: none"
 width="100%"
 height="100%"
 src="${directLink}"
 title="AreaButler Map Snippet"
></iframe>`;

        responseData.result = iframeCode.replace(/\n/g, '');
        return responseData;
      }

      case SnapshotDataTypesEnum.QR_CODE: {
        responseData.result = `${configService.getBaseApiUrl()}/api/location/embedded/qr-code/${
          snapshotResponse.token
        }`;

        return responseData;
      }
    }
  }

  async updatePoiData(): Promise<void> {
    const legacyPoiGroups = new Map([
      [OsmName.kiosk, PoiGroupEnum.kiosk_post_office],
      [OsmName.post_office, PoiGroupEnum.kiosk_post_office],
      [OsmName['multi-storey'], PoiGroupEnum.parking_garage],
      [OsmName.underground, PoiGroupEnum.parking_garage],
      [OsmName.tower, PoiGroupEnum.power_pole],
      [OsmName.pole, PoiGroupEnum.power_pole],
      [OsmName.bar, PoiGroupEnum.bar_pub],
      [OsmName.pub, PoiGroupEnum.bar_pub],
    ]);

    const osmNameMapping = new OsmEntityMapper().getOsmNameMapping();

    const legacyCondition = {
      $in: Array.from(legacyPoiGroups.keys()),
    };

    const filterQuery: FilterQuery<SearchResultSnapshotDocument> = {
      $or: [
        {
          ['config.defaultActiveGroups']: legacyCondition,
        },
        {
          ['config.hiddenGroups']: legacyCondition,
        },
        {
          ['snapshot.localityParams']: {
            $elemMatch: { groupName: { $exists: false } },
          },
        },
      ],
    };

    const projectQuery: ProjectionFields<SearchResultSnapshotDocument> = {
      ['config.defaultActiveGroups']: 1,
      ['config.hiddenGroups']: 1,
      ['snapshot.localityParams']: 1,
    };

    const processPoiGroup = (poiGroup: Set<TPoiGroupName>): TPoiGroupName[] => {
      for (const groupName of poiGroup) {
        if (legacyPoiGroups.has(groupName as OsmName)) {
          poiGroup.delete(groupName);
          const newGroupName = legacyPoiGroups.get(groupName as OsmName);

          if (!poiGroup.has(newGroupName)) {
            poiGroup.add(newGroupName);
          }
        }
      }

      return [...poiGroup];
    };

    const limit = 100;
    const snapshotCount = await this.searchResultSnapshotModel.count();

    for (let skip = 0; skip < snapshotCount; skip += limit) {
      const snapshots = await this.searchResultSnapshotModel
        .find(filterQuery, projectQuery)
        .limit(limit)
        .skip(skip);

      if (!snapshots.length) {
        continue;
      }

      await Promise.all(
        snapshots.map((snapshot) => {
          const {
            config: { defaultActiveGroups, hiddenGroups },
            snapshot: { localityParams },
          } = snapshot;

          if (defaultActiveGroups?.length) {
            const processedGroup = processPoiGroup(
              new Set(defaultActiveGroups),
            );

            snapshot.set('config.defaultActiveGroups', processedGroup);
            snapshot.markModified('config.defaultActiveGroups');
          }

          if (hiddenGroups?.length) {
            const processedGroup = processPoiGroup(new Set(hiddenGroups));
            snapshot.set('config.hiddenGroups', processedGroup);
            snapshot.markModified('config.hiddenGroups');
          }

          if (localityParams?.length) {
            const processLocalParams = localityParams.reduce<ApiOsmEntity[]>(
              (result, localityParam) => {
                if (!localityParam.groupName) {
                  localityParam.groupName = osmNameMapping.get(
                    localityParam.name,
                  )?.groupName;
                }

                result.push(localityParam);

                return result;
              },
              [],
            );

            snapshot.set('snapshot.localityParams', processLocalParams);
            snapshot.markModified('snapshot.localityParams');
          }

          return snapshot.save();
        }),
      );
    }
  }
}
