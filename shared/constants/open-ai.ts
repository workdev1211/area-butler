import {
  OpenAiCustomTextEnum,
  OpenAiQueryTypeEnum,
  OpenAiTonalityEnum,
} from "../types/open-ai";
import { OsmName } from "../types/types";

export const openAiTranslationDictionary: Record<
  OsmName,
  { singular: string; plural: string }
> = {
  bus_stop: { singular: "Bushaltestelle", plural: "Bushaltestellen" },
  chemist: { singular: "Drogerie", plural: "Drogerien" },
  dentist: { singular: "Zahnarzt", plural: "Zahnärzte" },
  doctors: { singular: "Arzt", plural: "Ärzte" },
  fitness_centre: { singular: "Fitnessstudio", plural: "Fitnessstudios" },
  fuel: { singular: "Tankstelle", plural: "Tankstellen" },
  hospital: { singular: "Krankenhaus", plural: "Krankenhäuser" },
  clinic: { singular: "Spezialklinik", plural: "Spezialkliniken" },
  kindergarten: { singular: "Kindergarten", plural: "Kindergärten" },
  motorway_link: { singular: "Autobahnauffahrt", plural: "Autobahnauffahrten" },
  park: { singular: "Park", plural: "Parks" },
  playground: { singular: "Spielplatz", plural: "Spielplätze" },
  post_office: { singular: "Postbüro", plural: "Postbüros" },
  restaurant: { singular: "Restaurant", plural: "Restaurants" },
  school: { singular: "Schule", plural: "Schulen" },
  sports_centre: { singular: "Sportstätte", plural: "Sportstätten" },
  station: { singular: "Bahnstation", plural: "Bahnstationen" },
  supermarket: { singular: "Supermarkt", plural: "Supermärkte" },
  swimming_pool: { singular: "Schwimmbad", plural: "Schwimmbäder" },
  theatre: { singular: "Theater", plural: "Theater" },
  university: { singular: "Univerität", plural: "Universitäten" },
  bar: { singular: "Bar", plural: "Bars" },
  kiosk: { singular: "Kiosk", plural: "Kioske" },
  sports_hall: { singular: "Sportplatz", plural: "Sportplätze" },
  hotel: { singular: "Hotel", plural: "Hotels" },
  pharmacy: { singular: "Apotheke", plural: "Apotheken" },
  attraction: { singular: "Sehenswürdigkeit", plural: "Sehenswürdigkeiten" },
  "multi-storey": { singular: "Parkhaus", plural: "Parkhäuser" },
  underground: { singular: "Parkhaus", plural: "Parkhäuser" },
  surface: { singular: "Parkplatz", plural: "Parkplätze" },
  museum: { singular: "Museum", plural: "Museen" },
  charging_station: { singular: "E-Ladepunkt", plural: "E-Ladepunkte" },
  wind_turbine: { singular: "Windrad", plural: "Windräder" },
  tower: { singular: "Strommast", plural: "Strommasten" },
  pole: { singular: "Strommast", plural: "Strommasten" },
  pub: { singular: "Bar", plural: "Bars" },
  favorite: { singular: "Favorit", plural: "Favoriten" },
  property: { singular: "Besitze", plural: "Besitze" },
};

export const openAiTonalities: Record<OpenAiTonalityEnum, string> = {
  [OpenAiTonalityEnum.FORMAL_SERIOUS]: "formale und seriöse",
  [OpenAiTonalityEnum.EASYGOING_YOUTHFUL]: "lockere und jugendliche",
};

export const openAiCustomText: { type: OpenAiCustomTextEnum; label: string }[] =
  [
    { type: OpenAiCustomTextEnum.NONE, label: "Keiner" },
    {
      type: OpenAiCustomTextEnum.POPULATION,
      label: "Der Text soll die Bevölkerungszahl der Stadt beinhalten.",
    },
    {
      type: OpenAiCustomTextEnum.SEO,
      label:
        "Der Text soll typische Immobilien SEO Begriffe beinhalten und SEO optimiert sein.",
    },
    {
      type: OpenAiCustomTextEnum.REGION,
      label: "Der Text soll eine kurze Beschreibung der Region beinhalten.",
    },
    {
      type: OpenAiCustomTextEnum.POIS,
      label:
        "Der Text soll einige Sehenswürdigkeiten in der Umgebung hervorheben.",
    },
    {
      type: OpenAiCustomTextEnum.OFFICE,
      label: "Der Text soll für eine Büroimmobilien optimiert sein.",
    },
    {
      type: OpenAiCustomTextEnum.COMMERCIAL,
      label: "Der Text soll für eine Gewerbeimmobilie optimiert sein.",
    },
    {
      type: OpenAiCustomTextEnum.RESIDENTIAL,
      label: "Der Text soll für eine Wohnimmobilie optimiert sein.",
    },
    { type: OpenAiCustomTextEnum.CUSTOM, label: "Eigenen Text eingeben." },
  ];

export const openAiQueryType: Array<{
  type: OpenAiQueryTypeEnum;
  label: string;
}> = [
  {
    type: OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
    label: "Lagetext",
  },
  {
    type: OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    label: "Beschreibung der Immobilie",
  },
  {
    type: OpenAiQueryTypeEnum.LOCATION_ESTATE_DESCRIPTION,
    label: "Exposé Text für",
  },
  {
    type: OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
    label: "Transformation Sie-Form in Du-Form",
  },
  {
    type: OpenAiQueryTypeEnum.GENERAL_QUESTION,
    label: "Generelle Frage an KI stellen",
  },
];
