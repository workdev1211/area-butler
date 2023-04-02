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

    case OnOfficeProductTypesEnum.OPEN_AI_50: {
      integrationUserProducts.push({
        quantity: quantity * 50,
        type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
      });

      break;
    }

    case OnOfficeProductTypesEnum.MAP_IFRAME: {
      integrationUserProducts.push(
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
        },
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME,
        },
      );

      break;
    }

    case OnOfficeProductTypesEnum.MAP_IFRAME_50: {
      const resultingQuantity = quantity * 50;

      integrationUserProducts.push(
        {
          quantity: resultingQuantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
        },
        {
          quantity: resultingQuantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME,
        },
      );

      break;
    }

    case OnOfficeProductTypesEnum.ONE_PAGE: {
      integrationUserProducts.push(
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
        },
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME,
        },
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE,
        },
      );

      break;
    }

    case OnOfficeProductTypesEnum.ONE_PAGE_50: {
      const resultingQuantity = quantity * 50;

      integrationUserProducts.push(
        {
          quantity: resultingQuantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
        },
        {
          quantity: resultingQuantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME,
        },
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE,
        },
      );

      break;
    }
  }

  return integrationUserProducts;
};
