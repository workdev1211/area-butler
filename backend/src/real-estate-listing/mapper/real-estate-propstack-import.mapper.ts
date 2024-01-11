// TODO should be removed in the future after some testing because now the status fields are completely custom

import { ApiRealEstateStatusEnum } from '@area-butler-types/real-estate';
import {
  IPropstackProcessedRealEstate,
  IPropstackRealEstate,
  IPropstackRealEstateStatus,
} from '../../shared/propstack.types';

export enum PropstackCustomUserEmailsEnum {
  NADINE = 'nadine.capoen@immoaddict.de',
}

export const propstackCustomSyncStatuses: Record<
  PropstackCustomUserEmailsEnum,
  Array<IPropstackRealEstateStatus & { areaButlerStatus: string }>
> = {
  [PropstackCustomUserEmailsEnum.NADINE]: [
    {
      id: 10617,
      name: 'zu vermieten',
      areaButlerStatus: ApiRealEstateStatusEnum.FOR_RENT,
    },
    {
      id: 11558,
      name: 'zu verkaufen',
      areaButlerStatus: ApiRealEstateStatusEnum.FOR_SALE,
    },
    {
      id: 65464,
      name: 'vermietet (Webseite)',
      areaButlerStatus: ApiRealEstateStatusEnum.RENTED,
    },
    {
      id: 65465,
      name: 'verkauft (Webseite)',
      areaButlerStatus: ApiRealEstateStatusEnum.SOLD,
    },
  ],
};

export const processCustomPropstackStatus = (
  email: string,
  realEstate: IPropstackRealEstate,
): void => {
  switch (email) {
    case PropstackCustomUserEmailsEnum.NADINE: {
      const areaButlerStatus = propstackCustomSyncStatuses[email].find(
        ({ id }) => id === realEstate.status.id,
      )?.areaButlerStatus;

      (realEstate as IPropstackProcessedRealEstate).areaButlerStatus =
        areaButlerStatus || ApiRealEstateStatusEnum.IN_PREPARATION;
    }
  }
};
