import { IApiOnOfficeProcessedRealEstate } from '../dto/api-on-office-to-area-butler.dto';
import { ApiRealEstateStatusEnum } from '@area-butler-types/real-estate';
import {
  ApiOnOfficeEstateMarketTypesEnum,
  IApiOnOfficeRealEstate,
} from '@area-butler-types/on-office';

export enum ApiOnOfficeRealEstStatusByUserEmailsEnum {
  REMAX = 'immoservice-paderborn@remax.de',
  VOVA = 'vladimir.kuznetsov@brocoders.team',
}

// Refer to the keys of 'permittedvalues' of the 'status2' field description
const remaxArchived = [
  'AuftragAbgelaufen',
  'AuftragAufgehoben',
  'AuftragNichtErhalten',
  'status2obj_archiviert',
];
const remaxInPreparation = [
  'passive_vermarktung',
  'VermarktungPause',
  'vorbereitung',
];
const remaxMarketObservation = ['marktbeobachtung'];
const remaxRented = ['VermietetAllein'];
const remaxSold = ['VerkauftAllein'];
const remaxActive = ['aktive_vermarktung'];

const checkIsRemaxStatus = (status: string, remaxStatuses: string[]): boolean =>
  !!(
    status &&
    remaxStatuses.some(
      (remaxStatus) => remaxStatus === status.substring(0, remaxStatus.length),
    )
  );

export const setRealEstateStatusByUserEmail = (
  email: string,
  realEstate: IApiOnOfficeRealEstate,
): void => {
  let status = ApiRealEstateStatusEnum.IN_PREPARATION;

  switch (email) {
    case ApiOnOfficeRealEstStatusByUserEmailsEnum.VOVA:
    case ApiOnOfficeRealEstStatusByUserEmailsEnum.REMAX: {
      if (checkIsRemaxStatus(realEstate.status2, remaxArchived)) {
        status = ApiRealEstateStatusEnum.ARCHIVED;
        break;
      }
      if (checkIsRemaxStatus(realEstate.status2, remaxInPreparation)) {
        status = ApiRealEstateStatusEnum.IN_PREPARATION;
        break;
      }
      if (checkIsRemaxStatus(realEstate.status2, remaxMarketObservation)) {
        status = ApiRealEstateStatusEnum.MARKET_OBSERVATION;
        break;
      }
      if (checkIsRemaxStatus(realEstate.status2, remaxRented)) {
        status = ApiRealEstateStatusEnum.RENTED;
        break;
      }
      if (checkIsRemaxStatus(realEstate.status2, remaxSold)) {
        status = ApiRealEstateStatusEnum.SOLD;
        break;
      }

      if (checkIsRemaxStatus(realEstate.status2, remaxActive)) {
        switch (realEstate.vermarktungsart.toUpperCase()) {
          case ApiOnOfficeEstateMarketTypesEnum.MIETE: {
            status = ApiRealEstateStatusEnum.FOR_RENT;
            break;
          }

          case ApiOnOfficeEstateMarketTypesEnum.KAUF: {
            status = ApiRealEstateStatusEnum.FOR_SALE;
            break;
          }
        }

        break;
      }

      break;
    }

    default: {
      return;
    }
  }

  (realEstate as IApiOnOfficeProcessedRealEstate).areaButlerStatus = status;
};
