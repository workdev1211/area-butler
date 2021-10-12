import { geocodeByAddress, getLatLng } from "react-google-places-autocomplete";
import { ApiCoordinates } from "../../../shared/types/types";
import harversine from "haversine";

export const deriveGeocodeByAddress = async (address: string) => {
  const latlngResults = await geocodeByAddress(address);
  return await getLatLng(latlngResults[0]);
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
