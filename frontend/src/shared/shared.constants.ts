import { CSSProperties } from "react";

import { ModalConfig } from "../components/FormModal";

export const googleMapsApiOptions = {
  id: "__googleMapsScriptId",
  language: "de",
  region: "de",
};

export const base64PrefixRegex = /data:.+;base64,/;

export const svgPrimaryColorFilter: CSSProperties = {
  filter:
    "brightness(0) saturate(100%) invert(19%) sepia(73%) saturate(4552%) hue-rotate(334deg) brightness(79%) contrast(98%)",
};

export enum MapboxStyleLabelsEnum {
  CLASSIC = "Classic",
  BASIC = "Basic",
  SATELLITE = "Satellite",
}

export type TMapboxStyleLabels = MapboxStyleLabelsEnum | string;

export const defaultMapboxStyles: Array<{
  key: string;
  label: MapboxStyleLabelsEnum;
}> = [
  {
    key: "kudiba-tech/ckvu0ltho2j9214p847jp4t4m",
    label: MapboxStyleLabelsEnum.CLASSIC,
  },
  {
    key: "kudiba-tech/clb9vfjx0000a15p2o942ryiy",
    label: MapboxStyleLabelsEnum.BASIC,
  },
  {
    key: "kudiba-tech/cl11xlpo8002y14nq8zm5j2ob",
    label: MapboxStyleLabelsEnum.SATELLITE,
  },
];

export const commonPaypalOptions = {
  components: "buttons",
  currency: "EUR",
  "disable-funding":
    "card,credit,paylater,bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort,venmo",
};

export const CHATBOT_SCRIPT_ID = "chatbot-script";

export const feedbackModalConfig: ModalConfig = {
  buttonTitle: "?",
  buttonClass: "feedback-button",
  modalTitle: "Hilfe & Feedback",
  onClose: () => {
    document.querySelector(`#${CHATBOT_SCRIPT_ID}`)?.remove();
    document.querySelector("#sib-conversations")?.remove();
  },
};

export const defaultMapZoom = 16.5;
export const defaultMyLocationIconSize = 46;
export const defaultAmenityIconSize = 32;

export const tourPaths = [
  "profile",
  "potential-customers",
  "real-estates",
  "snippet-editor",
  "search",
];

export const integrationTourPaths = ["search", "map"];

export const invertFilter: CSSProperties = { filter: "invert(100%)" };

export const poiNameMaxLength = 40;
