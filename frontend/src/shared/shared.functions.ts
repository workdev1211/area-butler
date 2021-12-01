import {geocodeByAddress, geocodeByLatLng, getLatLng} from "react-google-places-autocomplete";
import {ApiCoordinates, ApiUser, MeansOfTransportation, OsmName} from "../../../shared/types/types";
import harversine from "haversine";
import parkIcon from "../assets/icons/icons-20-x-20-outline-ic-park.svg";
import fuelIcon from "../assets/icons/icons-20-x-20-outline-ic-gasstation.svg";
import chemistIcon from "../assets/icons/icons-20-x-20-outline-ic-chemist.svg";
import trainIcon from "../assets/icons/icons-20-x-20-outline-ic-train.svg";
import barIcon from "../assets/icons/icons-20-x-20-outline-ic-bar.svg";
import busIcon from "../assets/icons/icons-20-x-20-outline-ic-bus.svg";
import restaurantIcon from "../assets/icons/icons-20-x-20-outline-ic-gastro.svg";
import theaterIcon from "../assets/icons/icons-20-x-20-outline-ic-theater.svg";
import playgroundIcon from "../assets/icons/icons-20-x-20-outline-ic-playground.svg";
import kindergartenIcon from "../assets/icons/icons-20-x-20-outline-ic-kindergarten.svg";
import schoolIcon from "../assets/icons/icons-20-x-20-outline-ic-school.svg";
import universityIcon from "../assets/icons/icons-20-x-20-outline-ic-university.svg";
import doctorIcon from "../assets/icons/icons-20-x-20-outline-ic-doctor.svg";
import clinicIcon from "../assets/icons/icons-20-x-20-outline-ic-hospital.svg";
import postofficeIcon from "../assets/icons/icons-20-x-20-outline-ic-paketshop.svg";
import highwayIcon from "../assets/icons/icons-20-x-20-outline-ic-highway.svg";
import sportIcon from "../assets/icons/icons-20-x-20-outline-ic-sport.svg";
import preferredLocationIcon from "../assets/icons/icons-24-x-24-illustrated-ic-starred.svg";
import realEstateListingIcon from "../assets/icons/icons-20-x-20-outline-ic-ab.svg";
import {toast} from "react-toastify";
import {calculateMinutesToMeters} from "../../../shared/constants/constants";
const tinyColor = require("tinycolor2");


export interface ColorPalette {
    primaryColor: string;
    primaryColorLight: string;
    primaryColorDark: string;
    textColor: string;
}

export const deriveGeocodeByAddress = async (address: string) => {
  const latlngResults = await geocodeByAddress(address);
  return await getLatLng(latlngResults[0]);
};

export const deriveAddressFromCoordinates = async (coordinates: ApiCoordinates) : Promise<{label: string, value: {place_id: string}} | null> => {
    const places = await geocodeByLatLng(coordinates);
    if (!!places && places.length > 0) {
        const {formatted_address, place_id} = places[0];
        return {
            label: formatted_address,
            value: {
                place_id
            }
        }
    } else {
        return null;
    }
}

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

export const deriveMinutesFromMeters = (distanceInMeters: number, mean: MeansOfTransportation) => {
    return Math.round(distanceInMeters / (calculateMinutesToMeters.find(mtm => mtm.mean === mean)?.multiplicator || 1));
}

export const distanceToHumanReadable = (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
        return `${Math.floor(distanceInMeters)}m`;
    }
    if (distanceInMeters % 1000 === 0) {
        return `${Math.floor(distanceInMeters / 1000)}km`;
    } else {
        return `${Math.floor(distanceInMeters / 1000)}.${Math.ceil((distanceInMeters % 1000) / 100)}km`;
    }
}

export const timeToHumanReadable = (timeInMinutes: number): string => {
    if (timeInMinutes < 60) {
        return `${Math.floor(timeInMinutes)} Min.`;
    }
    if (timeInMinutes % 60 === 0) {
        return `${Math.floor(timeInMinutes / 60)} Std.`;
    } else {
        return `${Math.floor(timeInMinutes / 60)} Std. ${timeInMinutes % 60} Min.`;
    }
}

export const toastSuccess = (message: string) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
}

export const toastError = (message: string) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
}

export const preferredLocationsTitle = 'Wichtige Adressen';
export const preferredLocationsIcon = {
    icon: preferredLocationIcon,
    color: '#c91444'
}
export const realEstateListingsTitle = 'Meine Objekte';
export const realEstateListingsIcon = {
    icon: realEstateListingIcon,
    color: '#c91444'
}

export const deriveColorPalette = (hexColor: string): ColorPalette => {
  const hexColorTinyColor = new tinyColor(hexColor);
  return {
    primaryColor: hexColor,
    primaryColorLight: hexColorTinyColor.desaturate(30).lighten(10).toHexString(),
    primaryColorDark: hexColorTinyColor.saturate(30).darken(10).toHexString(),
    textColor: hexColorTinyColor.isDark() ? "#FFFFFF" : "#000000",
  };
};

export const deriveIconForOsmName = (osmName: OsmName): {icon: string, color: string} => {
    switch (osmName) {
        case OsmName.fuel:
            return {
                icon: fuelIcon,
                color: '#8E71EB'
            };
        case OsmName.park:
            return {
                icon: parkIcon,
                color: '#165B4E'
            };
        case OsmName.chemist:
            return {
                icon: chemistIcon,
                color: '#267F9D'
            }
        case OsmName.supermarket:
            return {
                icon: chemistIcon,
                color: '#267F9D'
            }
        case OsmName.kiosk:
            return {
                icon: chemistIcon,
                color: '#267F9D'
            }
        case OsmName.station:
            return {
                icon: trainIcon,
                color: '#CB513B'
            }
        case OsmName.bus_stop:
            return {
                icon: busIcon,
                color: '#C71362'
            }
        case OsmName.bar:
            return {
                icon: barIcon,
                color: '#E3BB3F'
            }
        case OsmName.restaurant:
            return {
                icon: restaurantIcon,
                color: '#48136D'
            }
        case OsmName.theatre:
            return {
                icon: theaterIcon,
                color: '#C91444'
            }
        case OsmName.playground:
            return {
                icon: playgroundIcon,
                color: '#D96666'
            }
        case OsmName.kindergarten:
            return {
                icon: kindergartenIcon,
                color: '#734242'
            }
        case OsmName.school:
            return {
                icon: schoolIcon,
                color: '#96476A'
            }
        case OsmName.university:
            return {
                icon: universityIcon,
                color: '#201C1E'
            }
        case OsmName.doctors:
            return {
                icon: doctorIcon,
                color: '#10A877'
            }
        case OsmName.dentist:
            return {
                icon: doctorIcon,
                color: '#10A877'
            }
        case OsmName.clinic:
            return {
                icon: clinicIcon,
                color: '#42AEA7'
            }
        case OsmName.hospital:
            return {
                icon: clinicIcon,
                color: '#42AEA7'
            }
        case OsmName.post_office:
            return {
                icon: postofficeIcon,
                color: '#66A3B7'
            }
        case OsmName.motorway_link:
            return {
                icon: highwayIcon,
                color: '#579BE4'
            }
        case OsmName.sports_centre:
        case OsmName.sports_hall:
        case OsmName.swimming_pool:
        case OsmName.fitness_centre:
            return {
                icon: sportIcon,
                color: '#9F532E'
            }
        default:
            return {
                icon: parkIcon,
                color: '#165B4E'
            };
    }
}

export const deriveTotalRequestContingent = (user: ApiUser) =>
  user?.requestContingents?.length > 0
    ? user.requestContingents
        .map((c) => c.amount)
        .reduce((acc, inc) => acc + inc)
    : 0;
