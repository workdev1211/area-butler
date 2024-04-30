import subscriptionImage from "../assets/icons/onoffice-products/subscription.png";
import statsExportImage from "../assets/icons/onoffice-products/full-package.png";
import openAiImage from "../assets/icons/onoffice-products/open-ai.png";

import { OnOfficeProductTypesEnum } from "../../../shared/types/on-office";
import { TIntegrationProductType } from "../../../shared/types/integration";

export const getOnOfficeProductImage = (
  productType: TIntegrationProductType
): string => {
  switch (productType) {
    case OnOfficeProductTypesEnum.OPEN_AI: {
      return openAiImage;
    }
    case OnOfficeProductTypesEnum.STATS_EXPORT: {
      return statsExportImage;
    }
    case OnOfficeProductTypesEnum.FLAT_RATE: {
      return subscriptionImage;
    }
    default: {
      const msg = `Product with type ${productType} not found!`;
      console.error(msg);
      throw new Error(msg);
    }
  }
};
