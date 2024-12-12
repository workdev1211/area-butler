import {
  geocodeByAddress,
  geocodeByLatLng,
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import harversine from "haversine";
import { toast } from "react-toastify";
import copy from "copy-to-clipboard";
import { LatLng } from "react-google-places-autocomplete/build/GooglePlacesAutocomplete.types";

import {
  ApiCoordinates,
  ApiSearchResponse,
  ApiUser,
  IApiPoiIcon,
  MeansOfTransportation,
  OsmName,
  PoiGroupEnum,
  TPoiGroupName,
} from "../../../shared/types/types";
import parkIcon from "../assets/icons/pois/park.svg";
import fuelIcon from "../assets/icons/pois/fuel.svg";
import chemistIcon from "../assets/icons/pois/chemist.svg";
import stationIcon from "../assets/icons/pois/station.svg";
import barIcon from "../assets/icons/pois/bar.svg";
import busStopIcon from "../assets/icons/pois/bus_stop.svg";
import restaurantIcon from "../assets/icons/pois/restaurant.svg";
import theatreIcon from "../assets/icons/pois/theatre.svg";
import playgroundIcon from "../assets/icons/pois/playground.svg";
import kindergartenIcon from "../assets/icons/pois/kindergarten.svg";
import schoolIcon from "../assets/icons/pois/school.svg";
import universityIcon from "../assets/icons/pois/university.svg";
import doctorsIcon from "../assets/icons/pois/doctors.svg";
import clinicIcon from "../assets/icons/pois/hospital.svg";
import motorwayLinkIcon from "../assets/icons/pois/motorway_link.svg";
import sportIcon from "../assets/icons/pois/sport.svg";
import kioskIcon from "../assets/icons/pois/kiosk.svg";
import hotelIcon from "../assets/icons/pois/hotel.svg";
import towerIcon from "../assets/icons/pois/tower.svg";
import parkingIcon from "../assets/icons/pois/parking.svg";
import parkingGarageIcon from "../assets/icons/pois/parking-garage.svg";
import attractionIcon from "../assets/icons/pois/attraction.svg";
import chargingStationIcon from "../assets/icons/pois/charging_station.svg";
import museumIcon from "../assets/icons/pois/museum.svg";
import pharmacyIcon from "../assets/icons/pois/pharmacy.svg";
import windTurbineIcon from "../assets/icons/pois/wind_turbine.svg";
import preferredLocationIcon from "../assets/icons/icons-24-x-24-illustrated-ic-starred.svg";
import realEstateListingIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import { meansOfTransportations } from "../../../shared/constants/constants";
import { IPoiIcon, IQueryParamsAndUrl } from "./shared.types";
import { Iso3166_1Alpha2CountriesEnum } from "../../../shared/types/location";
import { IApiIntegrationUser } from "../../../shared/types/integration-user";
import {
  defaultErrorMessage,
  notAllowedCountryMsg,
} from "../../../shared/constants/error";
import {
  availableCountries,
  defaultAllowedCountries,
} from "../../../shared/constants/location";

const tinyColor = require("tinycolor2");

export interface IColorPalette {
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  textColor: string;
}

export const dateDiffInDays = (d1: Date, d2: Date = new Date()): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  d1.setHours(0, 0, 0);
  d2.setHours(0, 0, 0);

  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / oneDay));
};

export const checkIsDarkColor = (color: string, invert = false) => {
  const rgb = parseInt(color.substring(color[0] === "#" ? 1 : 0), 16);
  const r = (rgb >> 16) & 0xff; // extract red
  const g = (rgb >> 8) & 0xff; // extract green
  const b = (rgb >> 0) & 0xff; // extract blue

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (luma < 100) !== invert;
};

export const deriveGeocodeByAddress = async (
  user: ApiUser | IApiIntegrationUser,
  address: string,
  isCheckCountry = true
): Promise<LatLng> => {
  const [place] = await geocodeByAddress(address);

  if (isCheckCountry) {
    checkIsCountryAllowed({ place, user });
  }

  return getLatLng(place);
};

export const deriveGeocodeByPlaceId = async (
  user: ApiUser | IApiIntegrationUser,
  placeId: string,
  isCheckCountry = true
): Promise<LatLng> => {
  const [place] = await geocodeByPlaceId(placeId);

  if (isCheckCountry) {
    checkIsCountryAllowed({ place, user });
  }

  return getLatLng(place);
};

export const deriveAddressFromCoordinates = async ({
  allowedCountries,
  coordinates,
  user,
  isCheckCountry = true,
}: {
  coordinates: ApiCoordinates;
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];
  isCheckCountry?: boolean;
  user?: ApiUser | IApiIntegrationUser;
}): Promise<{ label: string; value: { place_id: string } } | null> => {
  const places = await geocodeByLatLng(coordinates);

  if (!(places && places.length > 0)) {
    return null;
  }

  const place = places[0];

  if (isCheckCountry) {
    checkIsCountryAllowed({ place, allowedCountries, user });
  }

  const { formatted_address, place_id } = place;

  return {
    label: formatted_address,
    value: {
      place_id,
    },
  };
};

const checkIsCountryAllowed = ({
  place,
  allowedCountries,
  user,
}: {
  place: google.maps.GeocoderResult;
  allowedCountries?: Iso3166_1Alpha2CountriesEnum[];
  user?: ApiUser | IApiIntegrationUser;
}): void => {
  if (!place) {
    const errorMessage = "Ort nicht gefunden!";
    toastError(errorMessage);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const country = place.address_components.find(({ types }) =>
    types.includes("country")
  )?.short_name as Iso3166_1Alpha2CountriesEnum;

  let resAllowedCountries: Iso3166_1Alpha2CountriesEnum[] | undefined =
    availableCountries || allowedCountries;

  if (!resAllowedCountries && user) {
    resAllowedCountries = user.config.allowedCountries;
  }

  if (!resAllowedCountries) {
    resAllowedCountries = defaultAllowedCountries;
  }

  if (!resAllowedCountries.includes(country)) {
    toastError(notAllowedCountryMsg);
    console.error(notAllowedCountryMsg);
    throw new Error(notAllowedCountryMsg);
  }
};

const getCustomIconColor = (groupName?: TPoiGroupName): string => {
  switch (groupName) {
    case OsmName.fuel:
      return "#8E71EB";
    case OsmName.chemist:
    case OsmName.supermarket:
      return "#267F9D";
    case PoiGroupEnum.kiosk_post_office:
      return "#8F72EB";
    case OsmName.station:
      return "#267F9D";
    case OsmName.bus_stop:
      return "#C71362";
    case PoiGroupEnum.bar_pub:
      return "#E3BB3F";
    case OsmName.restaurant:
      return "#48136D";
    case OsmName.theatre:
      return "#C91444";
    case OsmName.playground:
      return "#D96666";
    case OsmName.kindergarten:
      return "#734242";
    case OsmName.school:
      return "#96476A";
    case OsmName.university:
      return "#201C1E";
    case OsmName.doctors:
    case OsmName.dentist:
      return "#10A877";
    case OsmName.clinic:
    case OsmName.hospital:
      return "#42AEA7";
    case OsmName.motorway_link:
      return "#579BE4";
    // case OsmName.swimming_pool:
    case OsmName.sports_centre:
    case OsmName.sports_hall:
    case OsmName.fitness_centre:
      return "#9F532E";
    case OsmName.hotel:
      return "#E4BC40";
    case PoiGroupEnum.power_pole:
      return "#165B4E";
    case PoiGroupEnum.parking_garage:
      return "#6563FF";
    case OsmName.surface:
      return "#6563FF";
    case OsmName.attraction:
      return "#640D24";
    case OsmName.charging_station:
      return "#579BE4";
    case OsmName.museum:
      return "#C91444";
    case OsmName.pharmacy:
      return "#9F532E";
    case OsmName.wind_turbine:
      return "#1A5A6B";
    case OsmName.park:
    default:
      return "#165B4E";
  }
};

export const distanceInMeters = (from: ApiCoordinates, to: ApiCoordinates) => {
  return harversine(
    {
      latitude: from.lat,
      longitude: from.lng,
    },
    {
      latitude: to.lat,
      longitude: to.lng,
    },
    { unit: "meter" }
  );
};

export const distanceToHumanReadable = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.floor(distanceInMeters)}m`;
  }

  if (distanceInMeters % 1000 === 0) {
    return `${Math.floor(distanceInMeters / 1000)}km`;
  } else {
    return `${Math.floor(distanceInMeters / 1000)}.${Math.ceil(
      (distanceInMeters % 1000) / 100
    )}km`;
  }
};

export const timeToHumanReadable = (timeInMinutes: number): string => {
  if (timeInMinutes < 60) {
    return `${Math.floor(timeInMinutes)} Min.`;
  }

  if (timeInMinutes % 60 === 0) {
    return `${Math.floor(timeInMinutes / 60)} Std.`;
  } else {
    return `${Math.floor(timeInMinutes / 60)} Std. ${Math.floor(
      timeInMinutes % 60
    )} Min.`;
  }
};

const defaultToastTime = 5 * 1000; // 5 sec

export const toastSuccess = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: defaultToastTime,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const toastError = (
  message: string,
  onClose = () => {},
  closeTimeMs: number | false = defaultToastTime
) => {
  toast.error(message, {
    onClose,
    position: "top-right",
    autoClose: closeTimeMs,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

export const toastDefaultError = (): void => {
  toastError(defaultErrorMessage);
};

// TODO think about uniting "getRealEstateListingsIcon", "getPreferredLocationsIcon" and "deriveIconForOsmName" into a single method
export const preferredLocationsTitle = "Wichtige Adressen";
export const getPreferredLocationsIcon = (
  userPoiIcons?: IApiPoiIcon[]
): IPoiIcon => {
  const customIcon = userPoiIcons?.find(
    ({ name }) => name === OsmName.favorite
  )?.file;

  return customIcon
    ? { icon: customIcon, color: getCustomIconColor(OsmName.favorite), isCustom: true }
    : { icon: preferredLocationIcon, color: "#c91444" };
};

export const getRealEstateListingsIcon = (
  poiIcons?: IApiPoiIcon[]
): IPoiIcon => {
  const customIcon = poiIcons?.find(
    ({ name }) => name === OsmName.property
  )?.file;

  return customIcon
    ? { icon: customIcon, color: getCustomIconColor(OsmName.property), isCustom: true }
    : { icon: realEstateListingIcon, color: "#c91444" };
};

export const deriveColorPalette = (hexColor: string): IColorPalette => {
  const hexColorTinyColor = new tinyColor(hexColor);

  return {
    primaryColor: hexColor,
    primaryColorLight: hexColorTinyColor
      .desaturate(30)
      .lighten(10)
      .toHexString(),
    primaryColorDark: hexColorTinyColor.saturate(30).darken(10).toHexString(),
    textColor: hexColorTinyColor.isDark() ? "#FFFFFF" : "#000000",
  };
};

export const deriveIconForPoiGroup = (
  groupName?: TPoiGroupName,
  poiIcons?: IApiPoiIcon[]
): IPoiIcon => {
  const customIcon = poiIcons?.find(({ name }) => name === groupName)?.file;

  if (customIcon) {
    return { icon: customIcon, color: getCustomIconColor(groupName), isCustom: true };
  }

  switch (groupName) {
    case OsmName.fuel:
      return {
        icon: fuelIcon,
        color: "#8E71EB",
      };
    case OsmName.chemist:
    case OsmName.supermarket:
      return {
        icon: chemistIcon,
        color: "#267F9D",
      };
    case PoiGroupEnum.kiosk_post_office:
      return {
        icon: kioskIcon,
        color: "#8F72EB",
      };
    case OsmName.station:
      return {
        icon: stationIcon,
        color: "#267F9D",
      };
    case OsmName.bus_stop:
      return {
        icon: busStopIcon,
        color: "#C71362",
      };
    case PoiGroupEnum.bar_pub:
      return {
        icon: barIcon,
        color: "#E3BB3F",
      };
    case OsmName.restaurant:
      return {
        icon: restaurantIcon,
        color: "#48136D",
      };
    case OsmName.theatre:
      return {
        icon: theatreIcon,
        color: "#C91444",
      };
    case OsmName.playground:
      return {
        icon: playgroundIcon,
        color: "#D96666",
      };
    case OsmName.kindergarten:
      return {
        icon: kindergartenIcon,
        color: "#734242",
      };
    case OsmName.school:
      return {
        icon: schoolIcon,
        color: "#96476A",
      };
    case OsmName.university:
      return {
        icon: universityIcon,
        color: "#201C1E",
      };
    case OsmName.doctors:
    case OsmName.dentist:
      return {
        icon: doctorsIcon,
        color: "#10A877",
      };
    case OsmName.clinic:
    case OsmName.hospital:
      return {
        icon: clinicIcon,
        color: "#42AEA7",
      };
    case OsmName.motorway_link:
      return {
        icon: motorwayLinkIcon,
        color: "#579BE4",
      };
    // case OsmName.swimming_pool:
    case OsmName.sports_centre:
    case OsmName.sports_hall:
    case OsmName.fitness_centre:
      return {
        icon: sportIcon,
        color: "#9F532E",
      };
    case OsmName.hotel:
      return {
        icon: hotelIcon,
        color: "#E4BC40",
      };
    case PoiGroupEnum.power_pole:
      return {
        icon: towerIcon,
        color: "#165B4E",
      };
    case PoiGroupEnum.parking_garage:
      return {
        icon: parkingGarageIcon,
        color: "#6563FF",
      };
    case OsmName.surface:
      return {
        icon: parkingIcon,
        color: "#6563FF",
      };
    case OsmName.attraction:
      return {
        icon: attractionIcon,
        color: "#640D24",
      };
    case OsmName.charging_station:
      return {
        icon: chargingStationIcon,
        color: "#579BE4",
      };
    case OsmName.museum:
      return {
        icon: museumIcon,
        color: "#C91444",
      };
    case OsmName.pharmacy:
      return {
        icon: pharmacyIcon,
        color: "#9F532E",
      };
    case OsmName.wind_turbine:
      return {
        icon: windTurbineIcon,
        color: "#1A5A6B",
      };
    case OsmName.park:
    default:
      return {
        icon: parkIcon,
        color: "#165B4E",
      };
  }
};

export const deriveTotalRequestContingent = (user: ApiUser) =>
  user?.requestContingents?.length
    ? user.requestContingents.reduce((acc, { amount }) => acc + amount, 0)
    : 0;

export const deriveAvailableMeansFromResponse = (
  searchResponse?: ApiSearchResponse
): MeansOfTransportation[] => {
  const routingKeys = Object.keys(searchResponse?.routingProfiles || []);

  return meansOfTransportations.reduce<MeansOfTransportation[]>(
    (result, { type }) => {
      if (routingKeys.includes(type)) {
        result.push(type);
      }

      return result;
    },
    []
  );
};

// IMPORTANT - please, use the appropriate methods from the 'useTools' hook
// export const createDirectLink = (token: string): string =>
//   `${window.location.origin}/embed?token=${token}`;

// export const createCodeSnippet = (token: string) => {
//   return `
// <iframe
//   style="border: none"
//   width="100%"
//   height="100%"
//   src="${createDirectLink(token)}"
//   title="AreaButler Map Snippet"
// ></iframe>
//   `;
// };

export const sanitizeFilename = (filename: string): string =>
  filename.replace(/[/\\?%*:|"<>]/g, "-");

// TODO move to shared map-menu functions
export const setBackgroundColor = (
  node: HTMLDivElement | null,
  color: string
): void => {
  if (!node) {
    return;
  }

  if (node.parentElement?.classList.contains("collapse-open")) {
    node.style.setProperty("background", color, "important");
    return;
  }

  node.style.setProperty("background", "#FFFFFF", "important");
};

export const getQueryParamsAndUrl = <T>():
  | IQueryParamsAndUrl<T>
  | undefined => {
  const currentUrl = window.location.href;
  const parsedUrl = currentUrl.match(/^(.*)\?(.*)$/);

  if (parsedUrl?.length !== 3) {
    console.debug("parsedUrl", parsedUrl);
    return;
  }

  return {
    queryParams: parsedUrl[2].split("&").reduce((result, currentParam) => {
      const keyValue = currentParam.split("=");
      // @ts-ignore
      result[keyValue[0]] = keyValue[1];

      return result;
    }, {} as T),
    url: parsedUrl[1],
  };
};

export const copyTextToClipboard = (text?: string): void => {
  if (!text) {
    return;
  }

  const isCopied = copy(text);
  // REDO this for translations
  if (isCopied) {
    toastSuccess("Erfolgreich in Zwischenablage kopiert!");
  }
};

export const processInputValue = <
  T extends boolean | number | string | undefined = string
>(
  value: T,
  valueType: "boolean" | "number" | "string" = "string"
): T | undefined => {
  const isIncorrectType = typeof value !== valueType;
  const isIncorrectString = typeof value === "string" && !value;

  return isIncorrectType || isIncorrectString ? undefined : value;
};
