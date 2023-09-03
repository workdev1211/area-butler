import {
  OpenAiCustomTextEnum,
  OpenAiOsmQueryNameEnum,
  OpenAiQueryTypeEnum,
  OpenAiTonalityEnum,
} from "../types/open-ai";
import { OsmName } from "../types/types";

export const openAiTranslationDictionary: Record<
  OsmName,
  { singular: string; plural: string }
> = {
  [OsmName.bus_stop]: { singular: "Bushaltestelle", plural: "Bushaltestellen" },
  [OsmName.chemist]: { singular: "Drogerie", plural: "Drogerien" },
  [OsmName.dentist]: { singular: "Zahnarzt", plural: "Zahnärzte" },
  [OsmName.doctors]: { singular: "Arzt", plural: "Ärzte" },
  [OsmName.fitness_centre]: {
    singular: "Fitnessstudio",
    plural: "Fitnessstudios",
  },
  [OsmName.fuel]: { singular: "Tankstelle", plural: "Tankstellen" },
  [OsmName.hospital]: { singular: "Krankenhaus", plural: "Krankenhäuser" },
  [OsmName.clinic]: { singular: "Spezialklinik", plural: "Spezialkliniken" },
  [OsmName.kindergarten]: { singular: "Kindergarten", plural: "Kindergärten" },
  [OsmName.motorway_link]: {
    singular: "Autobahnauffahrt",
    plural: "Autobahnauffahrten",
  },
  [OsmName.park]: { singular: "Park", plural: "Parks" },
  [OsmName.playground]: { singular: "Spielplatz", plural: "Spielplätze" },
  [OsmName.post_office]: { singular: "Postbüro", plural: "Postbüros" },
  [OsmName.restaurant]: { singular: "Restaurant", plural: "Restaurants" },
  [OsmName.school]: { singular: "Schule", plural: "Schulen" },
  [OsmName.sports_centre]: { singular: "Sportstätte", plural: "Sportstätten" },
  [OsmName.station]: { singular: "Bahnstation", plural: "Bahnstationen" },
  [OsmName.supermarket]: { singular: "Supermarkt", plural: "Supermärkte" },
  [OsmName.swimming_pool]: { singular: "Schwimmbad", plural: "Schwimmbäder" },
  [OsmName.theatre]: { singular: "Theater", plural: "Theater" },
  [OsmName.university]: { singular: "Univerität", plural: "Universitäten" },
  [OsmName.bar]: { singular: "Bar", plural: "Bars" },
  [OsmName.kiosk]: { singular: "Kiosk", plural: "Kioske" },
  [OsmName.sports_hall]: { singular: "Sportplatz", plural: "Sportplätze" },
  [OsmName.hotel]: { singular: "Hotel", plural: "Hotels" },
  [OsmName.pharmacy]: { singular: "Apotheke", plural: "Apotheken" },
  [OsmName.attraction]: {
    singular: "Sehenswürdigkeit",
    plural: "Sehenswürdigkeiten",
  },
  [OsmName["multi-storey"]]: { singular: "Parkhaus", plural: "Parkhäuser" },
  [OsmName.underground]: { singular: "Parkhaus", plural: "Parkhäuser" },
  [OsmName.surface]: { singular: "Parkplatz", plural: "Parkplätze" },
  [OsmName.museum]: { singular: "Museum", plural: "Museen" },
  [OsmName.charging_station]: {
    singular: "E-Ladepunkt",
    plural: "E-Ladepunkte",
  },
  [OsmName.wind_turbine]: { singular: "Windrad", plural: "Windräder" },
  [OsmName.tower]: { singular: "Strommast", plural: "Strommasten" },
  [OsmName.pole]: { singular: "Strommast", plural: "Strommasten" },
  [OsmName.pub]: { singular: "Bar", plural: "Bars" },
  [OsmName.favorite]: { singular: "Favorit", plural: "Favoriten" },
  [OsmName.property]: { singular: "Besitze", plural: "Besitze" },
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

export const openAiQueryTypes: Array<{
  type: OpenAiQueryTypeEnum;
  label: string;
  sidebarLabel: string;
}> = [
  {
    type: OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
    label: "Lagetext",
    sidebarLabel: "Lage - Beschreibung",
  },
  {
    type: OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
    label: "Beschreibung der Immobilie",
    sidebarLabel: "Objekt - Beschreibung",
  },
  {
    type: OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    label: "Exposé Text für",
    sidebarLabel: "Exposé-Text",
  },
  {
    type: OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
    label: "Transformation Sie-Form in Du-Form",
    sidebarLabel: "Umwandlung Sie in Du Form",
  },
  {
    type: OpenAiQueryTypeEnum.GENERAL_QUESTION,
    label: "Generelle Frage an KI stellen",
    sidebarLabel: "Generelle Anfrage – Ihre Tür zur KI",
  },
];

export const osmNameToOsmQueryNameMapping: Partial<
  Record<OsmName, OpenAiOsmQueryNameEnum>
> = {
  [OsmName.bus_stop]: OpenAiOsmQueryNameEnum.PUBLIC_TRANSPORT,
  [OsmName.station]: OpenAiOsmQueryNameEnum.PUBLIC_TRANSPORT,
  [OsmName.motorway_link]: OpenAiOsmQueryNameEnum.HIGHWAY_ACCESS,
  [OsmName.charging_station]: OpenAiOsmQueryNameEnum.CHARGING_STATIONS,
  [OsmName.fuel]: OpenAiOsmQueryNameEnum.GAS_STATIONS,
  [OsmName.supermarket]: OpenAiOsmQueryNameEnum.SUPERMARKETS_AND_DRUGSTORES,
  [OsmName.chemist]: OpenAiOsmQueryNameEnum.SUPERMARKETS_AND_DRUGSTORES,
  [OsmName.kindergarten]: OpenAiOsmQueryNameEnum.SCHOOLS_AND_KINDERGARDEN,
  [OsmName.school]: OpenAiOsmQueryNameEnum.SCHOOLS_AND_KINDERGARDEN,
  [OsmName.university]: OpenAiOsmQueryNameEnum.UNIVERSITIES,
  [OsmName.playground]: OpenAiOsmQueryNameEnum.PLAYGROUNDS_AND_PARKS,
  [OsmName.park]: OpenAiOsmQueryNameEnum.PLAYGROUNDS_AND_PARKS,
  [OsmName.bar]: OpenAiOsmQueryNameEnum.BARS_AND_RESTAURANTS,
  [OsmName.restaurant]: OpenAiOsmQueryNameEnum.BARS_AND_RESTAURANTS,
  [OsmName.theatre]: OpenAiOsmQueryNameEnum.THEATERS,
  [OsmName.fitness_centre]: OpenAiOsmQueryNameEnum.SPORTS,
  [OsmName.sports_centre]: OpenAiOsmQueryNameEnum.SPORTS,
  [OsmName.sports_hall]: OpenAiOsmQueryNameEnum.SPORTS,
  [OsmName.swimming_pool]: OpenAiOsmQueryNameEnum.SWIMMING_POOLS,
  [OsmName.doctors]: OpenAiOsmQueryNameEnum.DOCTORS,
  [OsmName.dentist]: OpenAiOsmQueryNameEnum.DOCTORS,
  [OsmName.clinic]: OpenAiOsmQueryNameEnum.DOCTORS,
  [OsmName.pharmacy]: OpenAiOsmQueryNameEnum.PHARMACIES,
  [OsmName.hospital]: OpenAiOsmQueryNameEnum.HOSPITALS,
  [OsmName.attraction]: OpenAiOsmQueryNameEnum.SIGHTS,
};
