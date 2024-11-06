import { Logger, UnprocessableEntityException } from '@nestjs/common';

import { IApiOnOfficeRequestAction } from '@area-butler-types/on-office';
import {
  IApiIntUserOnOfficeParams,
  IIntUserExpMatchParams,
} from '@area-butler-types/integration-user';
import {
  IOnOfficeActionResults,
  OnOfficeActionTypeEnum,
} from '../../shared/on-office.types';
import { applyClassMixins } from '../../../../../shared/functions/shared.functions';
import { OnOfficeCompanyUserMixin } from './on-office-company-user.mixin';
import { OnOfficeEstateMixin } from './on-office-estate.mixin';
import { OnOfficeMultiselectMixin } from './on-office-multiselect.mixin';
import {
  IApiIntCreateEstateLinkReq,
  TUpdEstTextFieldParams,
} from '@area-butler-types/integration';
import { TAreaButlerExportTypes } from '@area-butler-types/types';

export abstract class OnOfficeQueryBuilder {
  protected readonly actions: Map<
    OnOfficeActionTypeEnum,
    IApiOnOfficeRequestAction
  > = new Map();

  protected readonly logger = new Logger(OnOfficeQueryBuilder.name);
  protected timestamp: number;
  protected userParams: IApiIntUserOnOfficeParams;

  protected constructor() {
    applyClassMixins(OnOfficeQueryBuilder, [
      OnOfficeCompanyUserMixin,
      OnOfficeEstateMixin,
      OnOfficeMultiselectMixin,
    ]);
  }

  protected checkUserParams(): void {
    if (!this.userParams) {
      throw new UnprocessableEntityException();
    }
  }

  abstract setUserParams(userParams: IApiIntUserOnOfficeParams): this;
  abstract exec(): Promise<IOnOfficeActionResults>;

  // company / user
  getColorAndLogo: () => this;
  getUserData: () => this;

  // estate
  createLink: (
    createLinkReq: Omit<IApiIntCreateEstateLinkReq, 'exportType'>,
  ) => this;
  getAvailStatuses: () => this;
  getEstateData: (estateId: string) => this;
  updateTextFields: (
    estateId: string,
    textFieldsParams: TUpdEstTextFieldParams[],
    exportMatching: Partial<
      Record<TAreaButlerExportTypes, IIntUserExpMatchParams>
    >,
  ) => this;

  // multiselect
  getMultiselectConfig: () => this;
}
