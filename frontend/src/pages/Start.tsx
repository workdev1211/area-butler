import FormModal, { ModalConfig } from "components/FormModal";
import PotentialCustomerDropDown from "potential-customer/PotentialCustomerDropDown";
import React, { FunctionComponent, useContext, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import RealEstateListingFormHandler from "real-estate-listings/RealEstateListingFormHandler";
import RealEstateMenuList from "real-estate-listings/RealEstateListingMenuList";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { useAreaSearchState } from "state/area-search";
import useRealEstateListingState from "state/real-estate-listing";
import { meansOfTransportations, osmEntityTypes, unitsOfTransportation } from "../../../shared/constants/constants";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import {
    ApiSearch,
    ApiSearchResponse,
    MeansOfTransportation,
    OsmName,
    TransportationParam,
    UnitsOfTransportation
} from "../../../shared/types/types";
import { ConfigContext } from "../context/ConfigContext";
import { useHttp } from "../hooks/http";
import LocalityOptions, { localityOptionsDefaults } from "../search/Localitites";
import SearchResult from "../search/SearchResult";
import TransportationParams from "../search/TransportationParams";
import "./Start.css";

type GeoLocation = {
    latitude?: number | null;
    longitude?: number | null;
};

const Start: FunctionComponent = () => {
    const {googleApiKey} = useContext(ConfigContext);
    const {areaSearchState, setLocation, setPreferredAmenities, setRoutingProfiles, setSearchResponse} = useAreaSearchState();
    const {get, post} = useHttp();

    const [locationSearchBusy, setLocationSearchBusy] = useState(false);

    const { setRealEstateListings } = useRealEstateListingState();

    useEffect(() => {
      const fetchListings = async () => {
        setRealEstateListings(
          (await get<ApiRealEstateListing[]>("/api/real-estate-listings")).data
        );
      };
      fetchListings();
    }, [true]);


    const performLocationSearch = async () => {
        try {
            setLocationSearchBusy(true);
            const search: ApiSearch = {
                coordinates: areaSearchState.location!,
                meansOfTransportation: transportation,
                preferredAmenities: [...localityOptions],
            };
            const result = await post<ApiSearchResponse>(
                "/api/location/search",
                search
            );
            setSearchResponse(result.data);
            setCollapseLocalitiesOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLocationSearchBusy(false);
        }
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

    const [locationBusy, setLocationBusy] = useState(false);
    const locateUser = () => {
        if (window.navigator.geolocation) {
            setLocationBusy(true);
            window.navigator.geolocation.getCurrentPosition(
                (res: GeolocationPosition) => {
                    setLocation({
                        lng: res.coords.longitude,
                        lat: res.coords.latitude,
                    });
                    setValue(null);
                    setLocationBusy(false);
                    setCollapseSearchOpen(false);
                    setCollapseTransportationOpen(true);
                },
                (error: any) => setLocationBusy(false)
            );
        }
    };
    const [value, setValue] = useState(null);
    const deriveLangLat = async (value: any) => {
        const coordinates = await deriveGeocodeByAddress(value.label);
        setLocation(coordinates);
        setValue(value);
        setCollapseSearchOpen(false);
        setCollapseTransportationOpen(true);
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
                            disabled
                            value={areaSearchState.location?.lat || ""}
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
                            value={areaSearchState.location?.lng || ""}
                            disabled
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
                        className={locationBusy ? 'btn btn-sm btn-primary loading' : 'btn btn-sm btn-primary'}
                    >
                        Mein Standort
                    </button>
                </div>
            </div>
        );
    };

    const fillAddressFromListing = async (listing: ApiRealEstateListing) => {
        const result = await deriveGeocodeByAddress(listing.address);
        setLocation({
            lng: result.lng,
            lat: result.lat,
        });
    };

    const [localityOptions, setLocalityOptions] = useState<OsmName[]>(
        localityOptionsDefaults
    );

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
                    !areaSearchState.location?.lat ||
                    !areaSearchState.location?.lng ||
                    transportation.length === 0
                }
                onClick={performLocationSearch}
                className={locationSearchBusy ? 'btn btn-primary btn-sm loading' : 'btn btn-primary btn-sm'}
            >
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

    return (
        <div className="container mx-auto mt-10">
            <h1 className="flex text-2xl">Umgebungsanalyse</h1>
            <RealEstateMenuList
                fillAdressFromListing={fillAddressFromListing}
            ></RealEstateMenuList>
            <PotentialCustomerDropDown></PotentialCustomerDropDown>
            <div>
                <div
                    className={
                        collapseSearchOpen
                            ? collapseBaseClasses + ' collapse-open'
                            : collapseBaseClasses + ' collapse-close'
                    }
                >
                    <input
                        type="checkbox"
                        onClick={() => setCollapseSearchOpen(!collapseSearchOpen)}
                    />
                    <div className="collapse-title text-xl font-medium">
                        1. Standort ermitteln <span className='float-right mr-20 text-base'>
            {value && (value as any).label}
                        {areaSearchState.location?.lat && !value ? 'Mein Standort' : ''}
          </span>
                    </div>
                    <div className="collapse-content">
                        <div className="flex-col gap-6 mt-5">
                            <LocationAutoComplete/>
                            <LocationLatLng/>
                        </div>
                    </div>
                </div>
                <div
                    className={
                        collapseTransportationOpen
                            ? collapseBaseClasses + ' collapse-open'
                            : collapseBaseClasses + ' collapse-close'
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
                        {!collapseTransportationOpen && <div className='float-right mr-20 text-base'>
                            <div className='flex gap-6'>
                                {transportation.map(mean => {
                                    return <div key={mean.type}>
                                        <b>{meansOfTransportations.find(m => m.type === mean.type)?.label}:</b> <span
                                        className='font-base'>{mean.amount} {unitsOfTransportation.find(uot => uot.type === mean.unit)?.label}</span>

                                    </div>
                                })}
                            </div>
                        </div>}
                    </div>
                    <div className="collapse-content">
                        <div className="flex-col gap-6 mt-5">
                            <TransportationParams onChange={(value) => setTransportation([...value])}/>
                            <button type='button' className='btn btn-primary btn-sm' onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCollapseTransportationOpen(false);
                                setCollapseLocalitiesOpen(true);
                            }
                            }>Weiter
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    className={
                        collapseLocalitiesOpen
                            ? collapseBaseClasses + ' collapse-open'
                            : collapseBaseClasses + ' collapse-close'
                    }
                >
                    <input
                        type="checkbox"
                        onClick={() => setCollapseLocalitiesOpen(!collapseLocalitiesOpen)}
                    />
                    <div className="collapse-title text-xl font-medium">
                        3. Lokalitäten auswählen
                        { !collapseLocalitiesOpen && <div className='float-right mr-20 text-base'>
                            <div className='flex gap-6'>
                                {localityOptions.map(locality => <span key={locality}>
                                    &#10003; {osmEntityTypes.find(oet => oet.name === locality)?.label}
                                </span> )
                                }
                            </div>
                        </div>

                        }
                    </div>
                    <div className="collapse-content">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
                            <LocalityOptions defaults={localityOptions}
                                             onChange={(value) => setLocalityOptions(value)}/>
                        </div>
                        <div className="flex gap-6 mt-5">
                            <SearchButton/>
                        </div>
                    </div>
                </div>
            </div>
            {areaSearchState.response && (
                <div className={collapseBaseClasses + " collapse-open"}>
                    <input type="checkbox"/>
                    <div className="collapse-title text-xl font-medium">
                        4. Ergebnisse
                    </div>
                    <div className="collapse-content">
                        <div className='mt-5'>
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
                        <div className="mt-5">
                            <SearchResult/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Start;
