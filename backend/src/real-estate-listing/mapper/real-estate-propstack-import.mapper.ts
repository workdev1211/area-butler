// TODO should be removed in the future after some testing because now the status fields are completely custom

import { ApiRealEstateStatusEnum } from '@area-butler-types/real-estate';
import { IPropstackPropertyStatus } from '../../shared/propstack.types';

export enum PropstackCustomUserEmailsEnum {
  NADINE = 'nadine.capoen@immoaddict.de',
}

export const propstackCustomSyncStatuses: Record<
  PropstackCustomUserEmailsEnum,
  Array<IPropstackPropertyStatus & { areaButlerStatus: string }>
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

// could be used in the future
// export const processCustomPropstackStatus = <
//   T extends IPropstackProperty | IPropstackWebhookProperty,
// >(
//   email: string,
//   realEstate: IPropstackProperty,
// ): void => {
//   switch (email) {
//     case PropstackCustomUserEmailsEnum.NADINE: {
//       const areaButlerStatus = propstackCustomSyncStatuses[email].find(
//         ({ id }) => id === realEstate.status.id,
//       )?.areaButlerStatus;
//
//       (realEstate as TPropstackProcProperty<T>).areaButlerStatus =
//         areaButlerStatus || ApiRealEstateStatusEnum.IN_PREPARATION;
//     }
//   }
// };
