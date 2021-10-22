import {geocodeByAddress, geocodeByLatLng, getLatLng} from "react-google-places-autocomplete";
import {ApiCoordinates, MeansOfTransportation, OsmName} from "../../../shared/types/types";
import harversine from "haversine";
import parkIcon from "../assets/icons/icons-20-x-20-outline-ic-park.svg";
import fuelIcon from "../assets/icons/icons-20-x-20-outline-ic-gasstation.svg";
import chemistIcon from "../assets/icons/icons-20-x-20-outline-ic-chemist.svg";
import trainIcon from "../assets/icons/icons-20-x-20-outline-ic-train.svg";
import barIcon from "../assets/icons/icons-20-x-20-outline-ic-bar.svg";
import busIcon from "../assets/icons/icons-20-x-20-outline-ic-bus.svg";
import restaurantIcon from "../assets/icons/icons-20-x-20-outline-ic-gastro.svg";
import {toast} from "react-toastify";
import {calculateMinutesToMeters} from "../../../shared/constants/constants";

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

export const deriveIconForOsmName = (osmName: OsmName): {icon: string, color: string} => {
    switch (osmName) {
        case OsmName.fuel:
            return {
                icon: fuelIcon,
                color: '#8f72eb'
            };
        case OsmName.park:
            return {
                icon: parkIcon,
                color: '#175c4f'
            };
        case OsmName.chemist:
            return {
                icon: chemistIcon,
                color: '#267f9e'
            }
        case OsmName.supermarket:
            return {
                icon: chemistIcon,
                color: '#76c5e9'
            }
        case OsmName.station:
            return {
                icon: trainIcon,
                color: '#e1e4e5'
            }
        case OsmName.bus_stop:
            return {
                icon: busIcon,
                color: '#c91462'
            }
        case OsmName.bar:
            return {
                icon: barIcon,
                color: '#e4bc40'
            }
        case OsmName.restaurant:
            return {
                icon: restaurantIcon,
                color: '#399086'
            }
        default:
            return {
                icon: parkIcon,
                color: '#175c4f'
            };
    }
}
