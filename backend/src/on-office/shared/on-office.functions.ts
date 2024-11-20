import {
  IApiOnOfficeCreateOrderProduct,
  OnOfficeProductTypesEnum,
} from '@area-butler-types/on-office';
import {
  ApiIntUserOnOfficeProdContTypesEnum,
  IApiIntUserOnOfficeProduct,
} from '@area-butler-types/integration-user';

// TODO think about simplifying the logic
export const convertOnOfficeProdToIntUserProd = ({
  type,
  quantity,
}: IApiOnOfficeCreateOrderProduct): IApiIntUserOnOfficeProduct[] => {
  const integrationUserProducts: IApiIntUserOnOfficeProduct[] = [];

  switch (type) {
    case OnOfficeProductTypesEnum.OPEN_AI: {
      integrationUserProducts.push({
        quantity,
        type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
      });

      break;
    }

    case OnOfficeProductTypesEnum.OPEN_AI_10: {
      integrationUserProducts.push({
        quantity: quantity * 10,
        type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
      });

      break;
    }

    case OnOfficeProductTypesEnum.STATS_EXPORT: {
      integrationUserProducts.push({
        quantity,
        type: ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT,
      });

      break;
    }

    case OnOfficeProductTypesEnum.STATS_EXPORT_10: {
      const resultQuantity = quantity * 10;

      integrationUserProducts.push(
        {
          quantity: resultQuantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
        },
        {
          quantity: resultQuantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT,
        },
      );

      break;
    }
  }

  return integrationUserProducts;
};

// onOffice provides id numbers higher than 1000 with the dot thousand separator
// could be due to the 'formatoutput' parameter
export const processOnOfficeEstateId = (
  realEstateId: string,
): string | undefined => {
  const realEstateIdNum = parseInt(realEstateId.replace(/\D/g, ''), 10);

  if (typeof realEstateIdNum !== 'number') {
    return;
  }

  return `${realEstateIdNum}`;
};
