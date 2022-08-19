import { OpenAiTonalityEnum } from "../types/open-ai";
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
  favorite: { singular: "Favorit", plural: "Favoriten" },
  property: { singular: "Besitze", plural: "Besitze" },
};

export const openAiTonalities = [
  { label: "formal und seriös", type: OpenAiTonalityEnum.FORMAL_SERIOUS },
  {
    label: "locker und jugendlich",
    type: OpenAiTonalityEnum.EASYGOING_YOUTHFUL,
  },
];
