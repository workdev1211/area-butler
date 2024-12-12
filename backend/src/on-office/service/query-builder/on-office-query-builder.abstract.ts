import { Logger, UnprocessableEntityException } from '@nestjs/common';
import { LeanDocument } from 'mongoose';

import { IApiOnOfficeRequestAction } from '@area-butler-types/on-office';
import { IApiIntUserOnOfficeParams } from '@area-butler-types/integration-user';
import {
  IOnOfficeActionResults,
  OnOfficeActionTypeEnum,
} from '../../shared/on-office.types';
import { applyClassMixins } from '../../../../../shared/functions/shared.functions';
import { OnOfficeCompanyUserMixin } from './on-office-company-user.mixin';
import { OnOfficeEstateMixin } from './on-office-estate.mixin';
import {
  IOnOfficeMulSelReqValues,
  IOnOfficeMulSelValue,
  OnOfficeMultiselectMixin,
} from './on-office-multiselect.mixin';
import {
  IApiIntCreateEstateLinkReq,
  TUpdEstTextFieldParams,
} from '@area-butler-types/integration';
import { TCompanyExportMatch } from '@area-butler-types/company';
import { TIntegrationUserDocument } from '../../../user/schema/integration-user.schema';

export abstract class OnOfficeQueryBuilder {
  protected readonly actions: Map<
    OnOfficeActionTypeEnum,
    IApiOnOfficeRequestAction
  > = new Map();

  protected readonly logger = new Logger(OnOfficeQueryBuilder.name);
  protected timestamp: number;
  protected user: LeanDocument<TIntegrationUserDocument> & {
    parameters: IApiIntUserOnOfficeParams;
  };

  protected constructor() {
    applyClassMixins(OnOfficeQueryBuilder, [
      OnOfficeCompanyUserMixin,
      OnOfficeEstateMixin,
      OnOfficeMultiselectMixin,
    ]);
  }

  protected checkIsUserSet(): void {
    if (!this.user) {
      throw new UnprocessableEntityException();
    }
  }

  abstract setUser(user: LeanDocument<TIntegrationUserDocument>): this;
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
    exportMatching: TCompanyExportMatch,
  ) => this;

  // multiselect
  createMultiselectValues: (fieldValues: IOnOfficeMulSelValue[]) => this;
  getMultiselectValues: () => this;
  updateMultiselectValues: (fieldValues: IOnOfficeMulSelValue[]) => this;
  deleteMultiselectValues: (fieldKeys: string[]) => this;
  protected convertFieldValues: (
    fieldValues: IOnOfficeMulSelValue[],
  ) => IOnOfficeMulSelReqValues;
}
