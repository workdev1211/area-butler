import FormModal, {ModalConfig} from "components/FormModal";
import React, {FunctionComponent, useContext, useState} from "react";
import GooglePlacesAutocomplete, {geocodeByAddress, getLatLng,} from "react-google-places-autocomplete";
import RealEstateListingFormHandler from "real-estate-listings/RealEstateListingFormHandler";
import RealEstateMenuList from "real-estate-listings/RealEstateListingMenuList";
import {osmEntityTypes,} from "../../../shared/constants/constants";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {
  ApiSearch,
  ApiSearchResponse,
  MeansOfTransportation,
  OsmName,
  TransportationParam,
  UnitsOfTransportation,
} from "../../../shared/types/types";
import {ConfigContext} from "../context/ConfigContext";
import {useHttp} from "../hooks/http";
import SearchResult from "../search/SearchResult";
import "./Start.css";
import TransportationParams from "../search/TransportationParams";

type GeoLocation = {
  latitude?: number | null;
  longitude?: number | null;
};

const Start: FunctionComponent = () => {
  const { googleApiKey } = useContext(ConfigContext);
  const { post } = useHttp();

  const [locationSearchBusy, setLocationSearchBusy] = useState(false);
  const [locationSearchResult, setLocationSearchResult] =
    useState<ApiSearchResponse | null>(null);
  const performLocationSearch = async () => {
    setLocationSearchBusy(true);
    const search: ApiSearch = {
      coordinates: {
        lat: location.latitude!,
        lng: location.longitude!,
      },
      meansOfTransportation: transportation,
      preferredAmenities: [...localityOptions],
    };
    const result = await post<ApiSearchResponse>(
      "/api/location/search",
      search
    );
    setLocationSearchResult(result.data);
    setLocationSearchBusy(false);
  };
  const LocationAutoComplete = () => {
    return (
      <div className="col-span-2">
        <label className="label">
          <span>Adresse</span>
        </label>
        <GooglePlacesAutocomplete
          apiOptions={{
            language: "de",
            region: "de",
          }}
          autocompletionRequest={{
            componentRestrictions: {
              country: ["de"],
            },
          }}
          minLengthAutocomplete={5}
          selectProps={{
            value,
            onChange: deriveLangLat,
          }}
          apiKey={googleApiKey}
        />
      </div>
    );
  };

  const [location, setLocation] = useState<GeoLocation>({});
  const [locationBusy, setLocationBusy] = useState(false);
  const locateUser = () => {
    if (window.navigator.geolocation) {
      setLocationBusy(true);
      setLocation({});
      window.navigator.geolocation.getCurrentPosition(
        (res: GeolocationPosition) => {
          setLocation({
            longitude: res.coords.longitude,
            latitude: res.coords.latitude,
          });
          setLocationBusy(false);
        },
        (error: any) => setLocationBusy(false)
      );
    }
  };
  const [value, setValue] = useState(null);
  const deriveLangLat = async (value: any) => {
    const result = await deriveGeocodeByAddress(value.label);
    setLocation({
      longitude: result.lng,
      latitude: result.lat,
    });
    setValue(value);
  };
  const deriveGeocodeByAddress = async (address: string) => {
    const latlngResults = await geocodeByAddress(address);
    return await getLatLng(latlngResults[0]);
  };

  const modalConfig: ModalConfig = {
    buttonTitle: "Neues Objekt",
    buttonStyle: "btn btn-primary btn-sm",
    modalTitle: "Neues Objekt erstellen",
  };

  const LocationLatLng = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="label">
              <span>Lat</span>
            </label>
            <input
              type="text"
              value={location.latitude || ""}
              onChange={(event: any) =>
                setLocation({ ...location, latitude: event.target.value })
              }
              className="input input-bordered w-full"
              placeholder="Latitude"
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <span>Long</span>
            </label>
            <input
              type="text"
              value={location.longitude || ""}
              onChange={(event: any) =>
                setLocation({ ...location, longitude: event.target.value })
              }
              className="input input-bordered w-full"
              placeholder="Longitude"
            />
          </div>
        </div>
        <div className="flex items-end justify-start mb-2 gap-6">
          <button
            type="button"
            disabled={locationBusy}
            onClick={locateUser}
            className="btn btn-sm btn-primary"
          >
            {locationBusy && (
              <svg
                className="animate-spin -ml-1 mr-1 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            Mein Standort
          </button>
          {value && (
            <FormModal modalConfig={modalConfig}>
              <RealEstateListingFormHandler
                realEstateListing={{
                  name: (value as any)!.label,
                  address: (value as any)!.label,
                }}
              ></RealEstateListingFormHandler>
            </FormModal>
          )}
        </div>
      </div>
    );
  };



  const [localityOptions, setLocalityOptions] = useState<OsmName[]>(
    osmEntityTypes.map((entity) => entity.name)
  );
  const localities = osmEntityTypes.map((entity) => {
    return (
      <label className="flex items-center" key={entity.name}>
        <input
          type="checkbox"
          className="checkbox checkbox-xs checkbox-primary"
          checked={localityOptions.some((option) => option === entity.name)}
          onChange={(e) => {
            if (e.target.checked) {
              setLocalityOptions([...localityOptions, entity.name]);
            } else {
              setLocalityOptions(
                localityOptions.filter((option) => option !== entity.name)
              );
            }
          }}
        />
        <span className="ml-2">{entity.label}</span>
      </label>
    );
  });

  const [transportation, setTransportation] = useState<TransportationParam[]>([
    {
      type: MeansOfTransportation.WALK,
      amount: 5,
      unit: UnitsOfTransportation.MINUTES,
    },
    {
      type: MeansOfTransportation.BICYCLE,
      amount: 15,
      unit: UnitsOfTransportation.MINUTES,
    },
    {
      type: MeansOfTransportation.CAR,
      amount: 30,
      unit: UnitsOfTransportation.MINUTES,
    },
  ]);

  const SearchButton = () => {
    return (
      <button
        type="button"
        disabled={
          locationSearchBusy ||
          !location.latitude ||
          !location.longitude ||
          transportation.length === 0
        }
        onClick={performLocationSearch}
        className="btn btn-primary"
      >
        {locationSearchBusy && (
          <svg
            className="animate-spin -ml-1 mr-1 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        Suchen
      </button>
    );
  };

  const collapseBaseClasses =
    "collapse w-full border rounded-box border-base-300 collapse-arrow mt-10";
  const [collapseSearchOpen, setCollapseSearchOpen] = useState(true);
  const [collapseTransportationOpen, setCollapseTransportationOpen] =
    useState(false);
  const [collapseLocalitiesOpen, setCollapseLocalitiesOpen] = useState(false);
  const fillAddressFromListing = async (listing: ApiRealEstateListing) => {
    const result = await deriveGeocodeByAddress(listing.address);
    setLocation({
      longitude: result.lng,
      latitude: result.lat,
    });
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="flex text-2xl">Umgebungsanalyse</h1>
      <RealEstateMenuList
        fillAdressFromListing={fillAddressFromListing}
      ></RealEstateMenuList>
      <div>
        <div
          className={
            collapseSearchOpen
              ? collapseBaseClasses + " collapse-open"
              : collapseBaseClasses
          }
        >
          <input
            type="checkbox"
            onClick={() => setCollapseSearchOpen(!collapseSearchOpen)}
          />
          <div className="collapse-title text-xl font-medium">
            1. Standort ermitteln
          </div>
          <div className="collapse-content">
            <div className="flex-col gap-6 mt-5">
              <LocationAutoComplete />
              <LocationLatLng />
            </div>
          </div>
        </div>
        <div
          className={
            collapseTransportationOpen
              ? collapseBaseClasses + " collapse-open"
              : collapseBaseClasses
          }
        >
          <input
            type="checkbox"
            onClick={() =>
              setCollapseTransportationOpen(!collapseTransportationOpen)
            }
          />
          <div className="collapse-title text-xl font-medium">
            2. Fortbewegungsmittel angeben
          </div>
          <div className="collapse-content">
            <div className="flex-col gap-6 mt-5">
              <TransportationParams onChange={(value) => setTransportation([...value])} />
            </div>
          </div>
        </div>
        <div
          className={
            collapseLocalitiesOpen
              ? collapseBaseClasses + " collapse-open"
              : collapseBaseClasses
          }
        >
          <input
            type="checkbox"
            onClick={() => setCollapseLocalitiesOpen(!collapseLocalitiesOpen)}
          />
          <div className="collapse-title text-xl font-medium">
            3. Lokalitäten auswählen
          </div>
          <div className="collapse-content">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
              {localities}
            </div>
            <div className="flex-col gap-6 mt-5">
              <SearchButton />
            </div>
          </div>
        </div>
      </div>
      {locationSearchResult && (
        <div className={collapseBaseClasses + " collapse-open"}>
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">
            4. Ergebnisse
          </div>
          <div className="collapse-content">
            <div className="mt-5">
              {locationSearchResult && (
                <SearchResult searchResponse={locationSearchResult} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Start;
