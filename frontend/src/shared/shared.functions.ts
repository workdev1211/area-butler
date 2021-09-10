import { geocodeByAddress, getLatLng } from "react-google-places-autocomplete";

export const deriveGeocodeByAddress = async (address: string) => {
    const latlngResults = await geocodeByAddress(address);
    return await getLatLng(latlngResults[0]);
};