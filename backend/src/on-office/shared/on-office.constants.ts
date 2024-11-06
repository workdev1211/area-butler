import {
  ApiOnOfficeActionIdsEnum,
  ApiOnOfficeResourceTypesEnum,
} from '@area-butler-types/on-office';
import { OnOfficeActionTypeEnum } from './on-office.types';

export const activateUserPath = 'activate-user';

export const potentCustomerFieldName = 'TargetAudience';

export const estateFields = [
  'Id', // onOffice estate id
  'objekttitel',
  'strasse',
  'hausnummer',
  'plz',
  'ort',
  'land',
  'breitengrad',
  'laengengrad',
  'anzahl_zimmer',
  'wohnflaeche',
  'grundstuecksflaeche',
  'energyClass',
  'kaufpreis',
  'waehrung',
  'kaltmiete',
  'warmmiete',
  'anzahl_balkone',
  'unterkellert',
  'vermarktungsart',
  'status2',
  'objekttyp',
  'objektbeschreibung',
  potentCustomerFieldName,
];

export const onOfficeActionMapper: Map<
  OnOfficeActionTypeEnum,
  {
    actionId: ApiOnOfficeActionIdsEnum;
    actionType: OnOfficeActionTypeEnum;
    resourceType: ApiOnOfficeResourceTypesEnum;
  }
> = new Map([
  // company / user
  [
    OnOfficeActionTypeEnum.GET_COLOR_AND_LOGO,
    {
      actionId: ApiOnOfficeActionIdsEnum.READ,
      actionType: OnOfficeActionTypeEnum.GET_COLOR_AND_LOGO,
      resourceType: ApiOnOfficeResourceTypesEnum.BASIC_SETTINGS,
    },
  ],
  [
    OnOfficeActionTypeEnum.GET_USER_DATA,
    {
      actionId: ApiOnOfficeActionIdsEnum.READ,
      actionType: OnOfficeActionTypeEnum.GET_USER_DATA,
      resourceType: ApiOnOfficeResourceTypesEnum.USER,
    },
  ],
  // estate
  [
    OnOfficeActionTypeEnum.CREATE_LINK,
    {
      actionId: ApiOnOfficeActionIdsEnum.DO,
      actionType: OnOfficeActionTypeEnum.CREATE_LINK,
      resourceType: ApiOnOfficeResourceTypesEnum.UPLOAD_FILE,
    },
  ],
  [
    OnOfficeActionTypeEnum.GET_AVAIL_STATUSES,
    {
      actionId: ApiOnOfficeActionIdsEnum.GET,
      actionType: OnOfficeActionTypeEnum.GET_AVAIL_STATUSES,
      resourceType: ApiOnOfficeResourceTypesEnum.FIELDS,
    },
  ],
  [
    OnOfficeActionTypeEnum.GET_ESTATE_DATA,
    {
      actionId: ApiOnOfficeActionIdsEnum.READ,
      actionType: OnOfficeActionTypeEnum.GET_ESTATE_DATA,
      resourceType: ApiOnOfficeResourceTypesEnum.ESTATE,
    },
  ],
  [
    OnOfficeActionTypeEnum.UPDATE_TEXT_FIELDS,
    {
      actionId: ApiOnOfficeActionIdsEnum.MODIFY,
      actionType: OnOfficeActionTypeEnum.UPDATE_TEXT_FIELDS,
      resourceType: ApiOnOfficeResourceTypesEnum.ESTATE,
    },
  ],
  // multiselect
  [
    OnOfficeActionTypeEnum.GET_MULTISELECT_CONFIG,
    {
      actionId: ApiOnOfficeActionIdsEnum.GET,
      actionType: OnOfficeActionTypeEnum.GET_MULTISELECT_CONFIG,
      resourceType: ApiOnOfficeResourceTypesEnum.MULTISELECT_CONFIGURATION,
    },
  ],
]);
