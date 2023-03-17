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
}: IApiOnOfficeCreateOrderProduct): IApiIntUserOnOfficeProduct => {
  const integrationUserProduct = {} as IApiIntUserOnOfficeProduct;

  switch (type) {
    case OnOfficeProductTypesEnum.OPEN_AI: {
      Object.assign(integrationUserProduct, {
        quantity,
        type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
      });

      break;
    }

    case OnOfficeProductTypesEnum.OPEN_AI_50: {
      Object.assign(integrationUserProduct, {
        quantity: quantity * 50,
        type: ApiIntUserOnOfficeProdContTypesEnum.OPEN_AI,
      });

      break;
    }

    case OnOfficeProductTypesEnum.MAP_IFRAME: {
      Object.assign(integrationUserProduct, {
        quantity,
        type: ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME,
      });

      break;
    }

    case OnOfficeProductTypesEnum.MAP_IFRAME_50: {
      Object.assign(integrationUserProduct, {
        quantity: quantity * 50,
        type: ApiIntUserOnOfficeProdContTypesEnum.MAP_IFRAME,
      });

      break;
    }

    case OnOfficeProductTypesEnum.ONE_PAGE: {
      Object.assign(integrationUserProduct, {
        quantity,
        type: ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE,
      });

      break;
    }

    case OnOfficeProductTypesEnum.ONE_PAGE_50: {
      Object.assign(integrationUserProduct, {
        quantity: quantity * 50,
        type: ApiIntUserOnOfficeProdContTypesEnum.ONE_PAGE,
      });

      break;
    }
  }

  return integrationUserProduct;
};
