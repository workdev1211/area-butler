import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';

import { OnOfficeApiService } from '../../../client/on-office/on-office-api.service';
import { IApiOnOfficeRequest } from '@area-butler-types/on-office';
import { IApiIntUserOnOfficeParams } from '@area-butler-types/integration-user';
import { onOfficeActionMapper } from '../../shared/on-office.constants';
import {
  IOnOfficeActionResults,
  OnOfficeActionTypeEnum,
} from '../../shared/on-office.types';
import { OnOfficeQueryBuilder } from './on-office-query-builder.abstract';

@Injectable()
export class OnOfficeQueryBuilderService extends OnOfficeQueryBuilder {
  constructor(private readonly onOfficeApiService: OnOfficeApiService) {
    super();
  }

  setUserParams(userParams: IApiIntUserOnOfficeParams): this {
    this.actions.clear();
    this.timestamp = dayjs().unix();
    this.userParams = userParams;
    this.checkUserParams();

    return this;
  }

  async exec(): Promise<IOnOfficeActionResults> {
    if (!this.actions.size) {
      throw new UnprocessableEntityException(
        'No actions are going to be executed!',
      );
    }

    const request: IApiOnOfficeRequest = {
      token: this.userParams.token,
      request: { actions: [...this.actions.values()] },
    };

    const response = await this.onOfficeApiService.sendRequest(request);

    try {
      OnOfficeApiService.checkResponseIsSuccess(
        `${OnOfficeQueryBuilder.name} ---> ${this.exec.name}`,
        `Following actions failed: ${[...this.actions.keys()].join(', ')}!`,
        request,
        response,
      );
    } catch (e) {
      this.logger.debug(this.exec.name, this.userParams);
      throw new BadRequestException(e);
    }

    this.userParams = undefined;
    this.timestamp = undefined;
    this.actions.clear();

    const actionMapperValues = [...onOfficeActionMapper.values()];

    return response.response.results.reduce<IOnOfficeActionResults>(
      (result, currentValue) => {
        const { actionid: resActionId, resourcetype: resResourceType } =
          currentValue;

        const actionType = actionMapperValues.find(
          ({ actionId, resourceType }) =>
            actionId === resActionId && resourceType === resResourceType,
        )?.actionType;

        if (!actionType) {
          this.logger.log(this.exec.name, result);
          throw new UnprocessableEntityException();
        }

        switch (actionType) {
          case OnOfficeActionTypeEnum.GET_COLOR_AND_LOGO: {
            result[actionType] =
              currentValue.data.records[0].elements.basicData.characteristicsCi;
            break;
          }

          case OnOfficeActionTypeEnum.GET_USER_DATA: {
            const { email, Name: userName } =
              currentValue.data.records[0]?.elements || {};

            result[actionType] = { email, userName };
            break;
          }

          case OnOfficeActionTypeEnum.CREATE_LINK:
          case OnOfficeActionTypeEnum.UPDATE_TEXT_FIELDS:
          case OnOfficeActionTypeEnum.CREATE_MULTISELECT_VALUES:
          case OnOfficeActionTypeEnum.UPDATE_MULTISELECT_VALUES:
          case OnOfficeActionTypeEnum.DELETE_MULTISELECT_VALUES: {
            break;
          }

          case OnOfficeActionTypeEnum.GET_AVAIL_STATUSES: {
            const estateStatuses =
              currentValue.data.records[0].elements?.status2.permittedvalues;

            const estateMarketTypes =
              currentValue.data.records[0].elements?.vermarktungsart
                .permittedvalues;

            result[actionType] = {
              estateStatuses: estateStatuses
                ? Object.keys(estateStatuses).map((key) => ({
                    text: estateStatuses[key],
                    value: key,
                  }))
                : undefined,
              estateMarketTypes: estateMarketTypes
                ? Object.keys(estateMarketTypes).map((key) => ({
                    text: estateMarketTypes[key],
                    value: key,
                  }))
                : undefined,
            };

            break;
          }

          case OnOfficeActionTypeEnum.GET_ESTATE_DATA: {
            result[actionType] = currentValue.data.records[0]?.elements;
            break;
          }

          case OnOfficeActionTypeEnum.GET_MULTISELECT_VALUES: {
            result[actionType] = currentValue.data.records.map(
              ({ elements: { field, fieldcontent, position } }) => ({
                fieldKey: field,
                fieldValue: fieldcontent,
                position: position,
              }),
            );

            break;
          }

          // left for possible future usage
          // default: {
          //   result[actionType] = [...currentValue.data.records];
          // }
        }

        return result;
      },
      {},
    );
  }
}
