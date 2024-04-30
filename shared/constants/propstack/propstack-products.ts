import { PropstackProductTypeEnum } from "../../types/propstack";
import {
  IIntegrationProduct,
  TIntegrationProductType,
} from "../../types/integration";

export const openAiPropstackProduct: IIntegrationProduct = {
  name: "P1: Lagepläne & KI-Texte",
  type: PropstackProductTypeEnum.OPEN_AI,
  price: 9,
};

export const openAi10PropstackProduct: IIntegrationProduct = {
  name: "P1: Lagepläne & KI-Texte x10",
  type: PropstackProductTypeEnum.OPEN_AI_10,
  price: 69,
};

export const statsExportPropstackProduct: IIntegrationProduct = {
  name: "P2: Alle Funktionen",
  type: PropstackProductTypeEnum.STATS_EXPORT,
  price: 39,
};

export const statsExport10Propstackroduct: IIntegrationProduct = {
  name: "P2: Alle Funktionen x10",
  type: PropstackProductTypeEnum.STATS_EXPORT_10,
  price: 290,
};

export const flatRatePropstackProduct: IIntegrationProduct = {
  name: "Jahrespaket",
  type: PropstackProductTypeEnum.FLAT_RATE,
  price: 0,
};

export const allPropstackProducts: Record<
  TIntegrationProductType,
  IIntegrationProduct
> = {
  [PropstackProductTypeEnum.OPEN_AI]: openAiPropstackProduct,
  [PropstackProductTypeEnum.OPEN_AI_10]: openAi10PropstackProduct,
  [PropstackProductTypeEnum.STATS_EXPORT]: statsExportPropstackProduct,
  [PropstackProductTypeEnum.STATS_EXPORT_10]: statsExport10Propstackroduct,
  [PropstackProductTypeEnum.FLAT_RATE]: flatRatePropstackProduct,
};
