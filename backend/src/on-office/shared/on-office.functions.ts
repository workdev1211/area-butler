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

    case OnOfficeProductTypesEnum.MAP_IFRAME_10: {
      const resultingQuantity = quantity * 10;

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

    case OnOfficeProductTypesEnum.ONE_PAGE_10: {
      const resultingQuantity = quantity * 10;

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
          quantity: resultingQuantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE,
        },
      );

      break;
    }

    case OnOfficeProductTypesEnum.STATS_EXPORT: {
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
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT,
        },
      );

      break;
    }

    case OnOfficeProductTypesEnum.STATS_EXPORT_10: {
      const resultingQuantity = quantity * 10;

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
        {
          quantity,
          type: ApiIntUserOnOfficeProdContTypesEnum.STATS_EXPORT,
        },
      );

      break;
    }
  }

  return integrationUserProducts;
};
