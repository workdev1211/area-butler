import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  ApiShowTour,
  ApiTourNamesEnum,
  MeansOfTransportation,
  OsmName,
  OsmType,
  TPlaceholderSelectOptionKey,
  UnitsOfTransportation,
} from "../types/types";

export const kudibaCompany = {
  name: "KuDiBa GmbH",
  address: "Nobistor 16",
  zip: "22767",
  city: "Hamburg",
  mail: "info@area-butler.de",
  formattedAddress: () =>
    `${kudibaCompany.name}<br />${kudibaCompany.address}<br />${kudibaCompany.zip} ${kudibaCompany.city}`,
  court: "Amtsgericht Hamburg",
  regNr: "HRB 171915",
  vat: "DE349350290",
};

export const initialShowTour: ApiShowTour = {
  [ApiTourNamesEnum.SEARCH]: true,
  [ApiTourNamesEnum.RESULT]: true,
  [ApiTourNamesEnum.REAL_ESTATES]: true,
  [ApiTourNamesEnum.CUSTOMERS]: true,
  [ApiTourNamesEnum.PROFILE]: true,
  [ApiTourNamesEnum.EDITOR]: true,
  [ApiTourNamesEnum.INT_MAP]: false,
  [ApiTourNamesEnum.INT_SEARCH]: false,
};

export const localStorageConsentGivenKey = "ab-cg";
export const localStorageSearchContext = "ab-sc";

export const calculateMinutesToMeters = [
  { mean: MeansOfTransportation.WALK, multiplicator: 83 },
  { mean: MeansOfTransportation.BICYCLE, multiplicator: 233 },
  { mean: MeansOfTransportation.CAR, multiplicator: 338 },
];

export const unitsOfTransportation = [
  { label: "Minuten", type: UnitsOfTransportation.MINUTES },
  { label: "Kilometern", type: UnitsOfTransportation.KILOMETERS },
];

export const meansOfTransportations = [
  { label: "Zu Fuß", type: MeansOfTransportation.WALK, mode: "walking" },
  { label: "Fahrrad", type: MeansOfTransportation.BICYCLE, mode: "cycling" },
  { label: "Auto", type: MeansOfTransportation.CAR, mode: "driving" },
];

export const osmEntityTypes: ApiOsmEntity[] = [
  {
    type: OsmType.public_transport,
    name: OsmName.station,
    label: "S/U-Bahn",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 200,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.highway,
    name: OsmName.bus_stop,
    label: "Bushaltestelle",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 100,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.highway,
    name: OsmName.motorway_link,
    label: "Autobahnauffahrt",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 500,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.amenity,
    name: OsmName.charging_station,
    label: "E-Ladestation",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.fuel,
    label: "Tankstelle",
    category: ApiOsmEntityCategory.TRAFFIC,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.shop,
    name: OsmName.supermarket,
    label: "Supermarkt",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.shop,
    name: OsmName.chemist,
    label: "Drogerie",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.kiosk,
    label: "Kiosk/Paketshop",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.post_office,
    label: "Kiosk/Paketshop",
    category: ApiOsmEntityCategory.SUPPLIES,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.kindergarten,
    label: "Kindergarten",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 100,
    uniqueThreshold: 0.4,
  },
  {
    type: OsmType.amenity,
    name: OsmName.school,
    label: "Schule",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 50,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.university,
    label: "Universität",
    category: ApiOsmEntityCategory.EDUCATION,
    uniqueRadius: 400,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.playground,
    label: "Spielplatz",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.park,
    label: "Park",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 200,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.restaurant,
    label: "Restaurant",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.bar,
    label: "Bar",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.pub,
    label: "Bar",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 50,
    uniqueThreshold: 0.8,
  },
  {
    type: OsmType.amenity,
    name: OsmName.theatre,
    label: "Theater",
    category: ApiOsmEntityCategory.LEISURE,
    uniqueRadius: 500,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.fitness_centre,
    label: "Fitness",
    category: ApiOsmEntityCategory.SPORT,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.swimming_pool,
    label: "Schwimmbad",
    category: ApiOsmEntityCategory.SPORT,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.sports_centre,
    label: "Sportcenter",
    category: ApiOsmEntityCategory.SPORT,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.leisure,
    name: OsmName.sports_hall,
    label: "Sporthalle",
    category: ApiOsmEntityCategory.SPORT,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.pharmacy,
    label: "Apotheken",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.amenity,
    name: OsmName.doctors,
    label: "Arzt",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.dentist,
    label: "Zahnarzt",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 100,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.clinic,
    label: "Klinik",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 500,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.amenity,
    name: OsmName.hospital,
    label: "Krankenhaus",
    category: ApiOsmEntityCategory.HEALTH,
    uniqueRadius: 1000,
    uniqueThreshold: 0.6,
  },
  {
    type: OsmType.parking,
    name: OsmName.surface,
    label: "Parkplatz",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.parking,
    name: OsmName["multi-storey"],
    label: "Parkhaus",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.parking,
    name: OsmName.underground,
    label: "Parkhaus",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
    access: '!="private"',
  },
  {
    type: OsmType["generator:method"],
    name: OsmName.wind_turbine,
    label: "Windrad",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.power,
    name: OsmName.tower,
    label: "Strommast",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.power,
    name: OsmName.pole,
    label: "Strommast",
    category: ApiOsmEntityCategory.INFRASTRUCTURE,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.tourism,
    name: OsmName.hotel,
    label: "Hotels",
    category: ApiOsmEntityCategory.TOURISM,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.tourism,
    name: OsmName.museum,
    label: "Museum",
    category: ApiOsmEntityCategory.TOURISM,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
  {
    type: OsmType.tourism,
    name: OsmName.attraction,
    label: "Sehenswürdigkeiten",
    category: ApiOsmEntityCategory.TOURISM,
    uniqueRadius: 100,
    uniqueThreshold: 0.5,
  },
];

export const defaultColor = "#c91444";

export const placeholderSelectOptionKey: TPlaceholderSelectOptionKey =
  "placeholder";

export const paymentEnvironments = ["dev", "prod"] as const;

export const systemEnvironments = ["local", ...paymentEnvironments] as const;

export const umlautMap = {
  "\u00c4": "AE",
  "\u00d6": "OE",
  "\u00dc": "UE",
  "\u00e4": "ae",
  "\u00f6": "oe",
  "\u00fc": "ue",
  "\u00df": "ss",
};

export const onePageCharacterLimit = 800;
export const onePageOpenAiWordLimit = 60;
