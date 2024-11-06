import { IApiRealEstAvailIntStatuses } from '@area-butler-types/integration';
import { IApiOnOfficeRealEstate } from '@area-butler-types/on-office';
import { IOnOfficeMulSelValue } from '../service/query-builder/on-office-multiselect.mixin';

export enum OnOfficeWebhookUrlEnum {
  CREATE_MAP = 'create-map',
  CREATE_LOC_DESCS = 'create-loc-descs',
  CREATE_LOC_DESCS_MAP = 'create-loc-descs-map',
  TARGET_GROUP = 'target-group', // TODO should be removed after the implementation of the top endpoints
}

export enum OnOfficeActionTypeEnum {
  // company / user
  GET_COLOR_AND_LOGO = 'getColorAndLogo',
  GET_USER_DATA = 'getUserData',

  // estate
  CREATE_LINK = 'createLink',
  GET_AVAIL_STATUSES = 'getAvailStatuses',
  GET_ESTATE_DATA = 'getEstateData',
  UPDATE_TEXT_FIELDS = 'updateTextFields',

  // multiselect
  CREATE_MULTISELECT_VALUES = 'createMultiselectValues',
  GET_MULTISELECT_VALUES = 'getMultiselectValues',
  UPDATE_MULTISELECT_VALUES = 'updateMultiselectValues',
  DELETE_MULTISELECT_VALUES = 'deleteMultiselectValues',
}

export interface IOnOfficeActionResults
  extends Partial<Record<OnOfficeActionTypeEnum, unknown>> {
  // company / user
  [OnOfficeActionTypeEnum.GET_COLOR_AND_LOGO]?: { color: string; logo: string };
  [OnOfficeActionTypeEnum.GET_USER_DATA]?: { email: string; userName: string };
  // estate
  [OnOfficeActionTypeEnum.CREATE_LINK]?: void;
  [OnOfficeActionTypeEnum.GET_AVAIL_STATUSES]?: IApiRealEstAvailIntStatuses;
  [OnOfficeActionTypeEnum.GET_ESTATE_DATA]?: IApiOnOfficeRealEstate;
  [OnOfficeActionTypeEnum.UPDATE_TEXT_FIELDS]?: void;
  // multiselect
  [OnOfficeActionTypeEnum.CREATE_MULTISELECT_VALUES]?: void;
  [OnOfficeActionTypeEnum.GET_MULTISELECT_VALUES]?: IOnOfficeMulSelValue[];
  [OnOfficeActionTypeEnum.UPDATE_MULTISELECT_VALUES]?: void;
  [OnOfficeActionTypeEnum.DELETE_MULTISELECT_VALUES]?: void;
}
