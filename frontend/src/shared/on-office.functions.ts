import subscriptionIcon from "../assets/icons/onoffice-products/abo-coming-soon.png";
import statsExportIcon from "../assets/icons/onoffice-products/full-package.png";
import mapIframeIcon from "../assets/icons/onoffice-products/interaktive-karten.png";
import openAiIcon from "../assets/icons/onoffice-products/ki-texte.png";
import onePageIcon from "../assets/icons/onoffice-products/lage-expose.png";
import mapSnapshotIcon from "../assets/icons/onoffice-products/lageplane.png";

import { OnOfficeProductTypesEnum } from "../../../shared/types/on-office";

export const getOnOfficeProductImage = (
  productType: OnOfficeProductTypesEnum
): string => {
  switch (productType) {
    case OnOfficeProductTypesEnum.OPEN_AI: {
      return openAiIcon;
    }
    case OnOfficeProductTypesEnum.MAP_IFRAME: {
      return mapIframeIcon;
    }
    case OnOfficeProductTypesEnum.ONE_PAGE: {
      return onePageIcon;
    }
    case OnOfficeProductTypesEnum.STATS_EXPORT: {
      return statsExportIcon;
    }
    case OnOfficeProductTypesEnum.SUBSCRIPTION: {
      return subscriptionIcon;
    }

    case OnOfficeProductTypesEnum.MAP_SNAPSHOT:
    default: {
      return mapSnapshotIcon;
    }
  }
};
