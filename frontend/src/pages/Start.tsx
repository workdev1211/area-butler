import React, { FunctionComponent, useContext, useState } from "react";
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-google-places-autocomplete";
import {
  meansOfTransportations,
  osmEntityTypes,
  unitsOfTransportation,
} from "../../../shared/constants/constants";
import {
  ApiSearch,
  ApiSearchResponse,
  MeansOfTransportation,
  OsmName,
  TransportationParam,
  UnitsOfTransportation,
} from "../../../shared/types/types";
import { ConfigContext } from "../context/ConfigContext";
import { useHttp } from "../hooks/http";
import "./Start.css";
import SearchResult from "../search/SearchResult";

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
    setLocationSearchResult(result);
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
        <div className="flex items-end justify-start mb-2">
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
        </div>
      </div>
    );
  };

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
  const transportationItems = meansOfTransportations.map((t) => {
    return (
      <div className="flex-col gap-6 my-5" key={t.type}>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-xs checkbox-primary"
            checked={transportation.some((tr) => tr.type === t.type)}
            onChange={(e) => {
              if (e.target.checked) {
                setTransportation([
                  ...transportation,
                  {
                    type: t.type,
                    amount: 5,
                    unit: UnitsOfTransportation.MINUTES,
                  },
                ]);
              } else {
                setTransportation([
                  ...transportation.filter((tr) => tr.type !== t.type),
                ]);
              }
            }}
          />
          <span className="ml-2">{t.label}</span>
        </label>
        {transportation.some((tr) => tr.type === t.type) && (
          <div className="flex">
            <div>
              <label className="label">
                <span>
                  {" "}
                  {transportation.some(
                    (tr) =>
                      tr.type === t.type &&
                      tr.unit === UnitsOfTransportation.MINUTES
                  )
                    ? "Erreichbar in"
                    : "Im Umkreis von"}{" "}
                </span>
              </label>
              <input
                type="number"
                value={
                  transportation.find((tr) => tr.type === t.type)?.amount || ""
                }
                onChange={(event) =>
                  setTransportation(
                    transportation.map((tr) =>
                      tr.type === t.type
                        ? {
                            ...tr,
                            amount:
                              transportation.find((tr) => tr.type === t.type)
                                ?.unit === UnitsOfTransportation.MINUTES
                                ? parseInt(event.target.value) > 60
                                  ? 60
                                  : parseInt(event.target.value)
                                : parseInt(event.target.value),
                          }
                        : tr
                    )
                  )
                }
                className="input input-bordered"
                placeholder={
                  transportation.some(
                    (tr) =>
                      tr.type === t.type &&
                      tr.unit === UnitsOfTransportation.MINUTES
                  )
                    ? "Minuten"
                    : "Metern"
                }
              />
            </div>
            <label
              htmlFor={"toggle-" + t.label}
              className="flex items-end mb-2.5 ml-5 cursor-pointer"
            >
              <div className="mr-3 text-gray-700 font-medium">
                {
                  unitsOfTransportation.find(
                    (uot) => uot.type === UnitsOfTransportation.METERS
                  )?.label
                }
              </div>
              <div className="relative mb-1">
                <input
                  id={"toggle-" + t.label}
                  type="checkbox"
                  className="sr-only"
                  checked={transportation.some(
                    (tr) =>
                      tr.type === t.type &&
                      tr.unit === UnitsOfTransportation.MINUTES
                  )}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTransportation(
                        transportation.map((tr) =>
                          tr.type === t.type
                            ? {
                                ...tr,
                                unit: UnitsOfTransportation.MINUTES,
                              }
                            : tr
                        )
                      );
                    } else {
                      setTransportation(
                        transportation.map((tr) =>
                          tr.type === t.type
                            ? {
                                ...tr,
                                unit: UnitsOfTransportation.METERS,
                              }
                            : tr
                        )
                      );
                    }
                  }}
                />
                <div className="w-10 h-4 bg-gray-200 rounded-full shadow-inner"></div>
                <div className="dot absolute w-6 h-6 bg-white rounded-full shadow border -left-1 -top-1 transition"></div>
              </div>
              <div className="ml-3 text-gray-700 font-medium">
                {
                  unitsOfTransportation.find(
                    (uot) => uot.type === UnitsOfTransportation.MINUTES
                  )?.label
                }
              </div>
            </label>
          </div>
        )}
      </div>
    );
  });

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

  const collapseBaseClasses = 'collapse w-full border rounded-box border-base-300 collapse-arrow mt-10';
  const [collapseSearchOpen, setCollapseSearchOpen] = useState(true);
  const [collapseTransportationOpen, setCollapseTransportationOpen] = useState(false);
  const [collapseLocalitiesOpen, setCollapseLocalitiesOpen] = useState(false);

  return (
    <div className="container mx-auto mt-10">
      <h1 className="flex text-2xl">Umgebungsanalyse</h1>
      <form>
        <div className={collapseSearchOpen ? collapseBaseClasses + ' collapse-open' : collapseBaseClasses}>
          <input type="checkbox" onClick={() => setCollapseSearchOpen(!collapseSearchOpen)}/>
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
        <div className={collapseTransportationOpen ? collapseBaseClasses + ' collapse-open' : collapseBaseClasses}>
          <input type="checkbox" onClick={() => setCollapseTransportationOpen(!collapseTransportationOpen)} />
          <div className="collapse-title text-xl font-medium">
            2. Fortbewegungsmittel angeben
          </div>
          <div className="collapse-content">
            <div className="flex-col gap-6 mt-5">{transportationItems}</div>
          </div>
        </div>
        <div className={collapseLocalitiesOpen ? collapseBaseClasses + ' collapse-open' : collapseBaseClasses}>
          <input type="checkbox" onClick={() => setCollapseLocalitiesOpen(!collapseLocalitiesOpen)} />
          <div className="collapse-title text-xl font-medium" >
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
      </form>
      {locationSearchResult &&
      <div className={collapseBaseClasses + ' collapse-open'}>
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

      }
    </div>
  );
};

export default Start;
