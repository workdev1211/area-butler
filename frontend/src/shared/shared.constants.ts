import { CSSProperties } from "react";

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

export const mapBoxMapIds = {
  satellite: "kudiba-tech/cl11xlpo8002y14nq8zm5j2ob",
  default: "kudiba-tech/ckvu0ltho2j9214p847jp4t4m",
};
