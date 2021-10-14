import React, {useContext} from "react";
import DefaultLayout from "../layout/defaultLayout";
import LocationAutocomplete from "../components/LocationAutocomplete";
import {SearchContext, SearchContextActions} from "../context/SearchContext";
import MyLocationButton from "../components/MyLocationButton";
import {ApiCoordinates, ApiOsmEntity, ApiSearch, ApiSearchResponse} from "../../../shared/types/types";
import TransportationParams from "../components/TransportationParams";
import ImportantAddresses from "../components/ImportantAddresses";
import Input from "../components/Input";
import LocalityParams from "../components/LocalityParams";
import nextIcon from "../assets/icons/icons-16-x-16-outline-ic-next.svg";
import {useHttp} from "../hooks/http";
import {useCensusData} from "../hooks/censusdata";

const SearchParamsPage: React.FunctionComponent = () => {
    const {post} = useHttp();
    const {fetchNearData} = useCensusData();
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);

    const onLocationAutocompleteChange = (payload: any) => {
        searchContextDispatch({type: SearchContextActions.SET_PLACES_LOCATION, payload: payload.value});
        if (payload.coordinates) {
            searchContextDispatch({type: SearchContextActions.SET_LOCATION, payload: payload.coordinates});
        }
    }

    const onMyLocationChange = (coordinates: ApiCoordinates) => {
        searchContextDispatch({
            type: SearchContextActions.SET_LOCATION,
            payload: {
                ...coordinates
            }
        });
        searchContextDispatch({
            type: SearchContextActions.SET_PLACES_LOCATION,
            payload: {label: 'Mein Standort'}
        })
    }

    const SearchButton: React.FunctionComponent<any> = () => {
        const performLocationSearch = async () => {
            try {
                searchContextDispatch({type: SearchContextActions.SET_SEARCH_BUSY, payload: true});
                const search: ApiSearch = {
                    coordinates: searchContextState.location!,
                    meansOfTransportation: searchContextState.transportationParams,
                    preferredAmenities: searchContextState.localityParams.map((l: ApiOsmEntity) => l.name),
                };
                const result = await post<ApiSearchResponse>(
                    "/api/location/search",
                    search
                );
                searchContextDispatch({
                    type: SearchContextActions.SET_SEARCH_RESPONSE,
                    payload: result.data
                })
                const zensusData = await fetchNearData(searchContextState.location);
                searchContextDispatch({
                    type: SearchContextActions.SET_ZENSUS_DATA,
                    payload: zensusData
                });
            } catch (error) {
                console.error(error);
            } finally {
                searchContextDispatch({type: SearchContextActions.SET_SEARCH_BUSY, payload: false});
            }
        }

        const classes = 'btn bg-primary-gradient w-full sm:w-auto ';

        return <button
            type="button"
            disabled={
                searchContextState.searchBusy ||
                !searchContextState.location?.lat ||
                !searchContextState.location?.lng ||
                searchContextState.transportationParams.length === 0 ||
                searchContextState.localityParams.length === 0
            }
            onClick={performLocationSearch}
            className={searchContextState.searchBusy ? `${classes} loading` : classes}
        >
            Analyse Starten <img className="ml-1 -mt-0.5" src={nextIcon} alt="icon-next"/>
        </button>
    }

    return (
        <DefaultLayout title="Umgebungsanalyse" withHorizontalPadding={true} actionBottom={<SearchButton/>}>
            <h2>Standort</h2>
            <div className="sub-content grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationAutocomplete value={searchContextState.placesLocation} setValue={() => {
                }} afterChange={onLocationAutocompleteChange}/>
                <div className="flex flex-wrap items-end gap-4">
                    <Input label="Lat" type="text"
                           readOnly={true}
                           value={searchContextState.location?.lat || '-'}
                           className="input input-bordered w-full"
                           placeholder="Latitude"/>
                    <Input label="Long" type="text"
                           readOnly={true}
                           value={searchContextState.location?.lng || '-'}
                           className="input input-bordered w-full"
                           placeholder="Longitude"
                    />
                    <MyLocationButton classes="btn bg-primary-gradient w-full sm:w-auto"
                                      onComplete={onMyLocationChange}/>
                </div>
            </div>
            <h2>Mobilität</h2>
            <div className="sub-content">
                <TransportationParams values={searchContextState.transportationParams}
                                      onChange={(newParams) => searchContextDispatch({
                                          type: SearchContextActions.SET_TRANSPORTATION_PARAMS,
                                          payload: newParams
                                      })}/>
                <h3 className="mt-8">Wichtige Adressen</h3>
                <ImportantAddresses inputValues={searchContextState.preferredLocations}
                                    onChange={(importantAdresses) => searchContextDispatch({
                                        type: SearchContextActions.SET_PREFERRED_LOCATIONS,
                                        payload: importantAdresses
                                    })}/>
            </div>
            <h2>Lokalitäten</h2>
            <LocalityParams values={searchContextState.localityParams} onChange={(newValues) => searchContextDispatch({
                type: SearchContextActions.SET_LOCALITY_PARAMS,
                payload: newValues
            })}/>
        </DefaultLayout>
    )
}

export default SearchParamsPage;
