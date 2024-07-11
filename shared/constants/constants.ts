import {
  ApiShowTour,
  ApiTourNamesEnum,
  MeansOfTransportation,
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

export const minutesToMetersMultipliers: Record<MeansOfTransportation, number> =
  {
    [MeansOfTransportation.WALK]: 83,
    [MeansOfTransportation.BICYCLE]: 233,
    [MeansOfTransportation.CAR]: 338,
  };

export const unitsOfTransportation = [
  { label: "Minuten", type: UnitsOfTransportation.MINUTES },
  { label: "Kilometern", type: UnitsOfTransportation.KILOMETERS },
];

export const meansOfTransportations = [
  { label: "Zu Fuß", type: MeansOfTransportation.WALK, mode: "walking" },
  { label: "Fahrrad", type: MeansOfTransportation.BICYCLE, mode: "cycling" },
  { label: "Auto", type: MeansOfTransportation.CAR, mode: "driving" },
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

export const onePageCharacterLimit = 600;
export const boolStringMapping: { [key: string]: boolean } = {
  true: true,
  false: false,
};
