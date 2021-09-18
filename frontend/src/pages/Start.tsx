import FormModal, {ModalConfig} from "components/FormModal";
import {RealEstateListingActions, RealEstateListingContext} from "context/RealEstateListingContext";
import PotentialCustomerDropDown from "potential-customer/PotentialCustomerDropDown";
import React, {FunctionComponent, useContext, useEffect, useState} from "react";
import RealEstateListingFormHandler from "real-estate-listings/RealEstateListingFormHandler";
import RealEstateMenuList from "real-estate-listings/RealEstateListingMenuList";
import {deriveGeocodeByAddress} from "shared/shared.functions";
import {meansOfTransportations, osmEntityTypes, unitsOfTransportation} from "../../../shared/constants/constants";
import {ApiRealEstateListing} from "../../../shared/types/real-estate";
import {ApiSearch, ApiSearchResponse, OsmName, TransportationParam} from "../../../shared/types/types";
import {useHttp} from "../hooks/http";
import LocalityOptions from "../search/Localitites";
import SearchResult from "../search/SearchResult";
import TransportationParams from "../search/TransportationParams";
import "./Start.css";
import "../map/makiIcons.css";
import LocationAutocomplete from "../search/LocationAutocomplete";
import {SearchContext, SearchContextActions} from "../context/SearchContext";
import {fallbackIcon, osmNameToIcons} from "../map/makiIcons";

const Start: FunctionComponent = () => {
    const {get, post} = useHttp();
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);
    const [placesValue, setPlacesValues] = useState<{label:string, value: any} | null>(null);

    const [locationBusy, setLocationBusy] = useState(false);
    const locateUser = () => {
        if (window.navigator.geolocation) {
            setLocationBusy(true);
            window.navigator.geolocation.getCurrentPosition(
                (res: GeolocationPosition) => {
                    searchContextDispatch({
                        type: SearchContextActions.SET_LOCATION,
                        payload: {
                            lng: res.coords.longitude,
                            lat: res.coords.latitude
                        }
                    });
                    searchContextDispatch({
                        type: SearchContextActions.SET_PLACES_LOCATION
                    })
                    setLocationBusy(false);
                    setCollapseSearchOpen(false);
                    setCollapseTransportationOpen(true);
                },
                (error: any) => setLocationBusy(false)
            );
        }
    };


    const { realEstateDispatch } = React.useContext(
        RealEstateListingContext
      );
    useEffect(() => {
      const fetchListings = async () => {
        realEstateDispatch({
          type: RealEstateListingActions.SET_REAL_ESTATE_LISTINGS,
          payload: (
            await get<ApiRealEstateListing[]>("/api/real-estate-listings")
          ).data,
        });
      };
      fetchListings();
    }, [true]);


    const [locationSearchBusy, setLocationSearchBusy] = useState(false);
    const performLocationSearch = async () => {
        try {
            setLocationSearchBusy(true);
            const search: ApiSearch = {
                coordinates: searchContextState.location!,
                meansOfTransportation: searchContextState.transportationParams,
                preferredAmenities: [...searchContextState.localityOptions],
            };
            const result = await post<ApiSearchResponse>(
                "/api/location/search",
                search
            );
            searchContextDispatch({
                type: SearchContextActions.SET_SEARCH_RESPONSE,
                payload: result.data
            })
            setCollapseLocalitiesOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLocationSearchBusy(false);
        }
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
                            value={searchContextState.location?.lat || ""}
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
                            value={searchContextState.location?.lng || ""}
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
        const { lat, lng } = result;
        const placesLocation = {label: listing.address, value: {place_id: null, description: listing.address}};
        setPlacesValues(placesLocation);
        searchContextDispatch({
            type: SearchContextActions.SET_PLACES_LOCATION,
            payload: placesLocation
        })
        searchContextDispatch({
            type: SearchContextActions.SET_LOCATION,
            payload: {
                lat,
                lng
            }
        })
        setCollapseSearchOpen(false);
    };

    const SearchButton = () => {
        return (
            <button
                type="button"
                disabled={
                    locationSearchBusy ||
                    !searchContextState.location?.lat ||
                    !searchContextState.location?.lng ||
                    searchContextState.transportationParams.length === 0
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
            {searchContextState.placesLocation && (searchContextState.placesLocation as any).label}
                        {searchContextState.location?.lat && !searchContextState.placesLocation?.label ? 'Mein Standort' : ''}
          </span>
                    </div>
                    <div className="collapse-content">
                        <div className="flex-col gap-6 mt-5">
                            <LocationAutocomplete 
                            afterChange={() => { setCollapseSearchOpen(false); setCollapseTransportationOpen(true)}}
                            value={placesValue}
                            setValue={setPlacesValues}/>
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
                                {searchContextState.transportationParams.map((mean: TransportationParam) => {
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
                            <TransportationParams onChange={(value) => searchContextDispatch({ type: SearchContextActions.SET_TRANSPORTATION_PARAMS, payload: [...value]})}/>
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
                                {searchContextState.localityOptions.map((locality: OsmName) => <span key={locality}>
                                    <img src={osmNameToIcons.find(entry => entry.name === locality)?.icon || fallbackIcon} className={locality}/> {osmEntityTypes.find(oet => oet.name === locality)?.label}
                                </span> )
                                }
                            </div>
                        </div>

                        }
                    </div>
                    <div className="collapse-content">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5">
                            <LocalityOptions defaults={searchContextState.localityOptions}
                                             onChange={(value) => searchContextDispatch({ type: SearchContextActions.SET_LOCALITY_OPTIONS, payload: value})}/>
                        </div>

                    </div>
                </div>
            </div>
            <div className="flex gap-6 mt-5">
                            <SearchButton/>
            </div>
            {searchContextState.searchResponse && (
                <div className={collapseBaseClasses + " collapse-open"}>
                    <input type="checkbox"/>
                    <div className="collapse-title text-xl font-medium">
                        4. Ergebnisse
                    </div>
                    <div className="collapse-content">
                        <div className='mt-5'>
                            {searchContextState.placesLocation && (
                                <FormModal modalConfig={modalConfig}>
                                    <RealEstateListingFormHandler
                                        realEstateListing={{
                                            name: (searchContextState.placesLocation as any)!.label,
                                            address: (searchContextState.placesLocation as any)!.label,
                                        }}
                                    />
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
