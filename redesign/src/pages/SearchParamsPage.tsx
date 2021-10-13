import React, {useContext} from "react";
import DefaultLayout from "../layout/defaultLayout";
import LocationAutocomplete from "../components/LocationAutocomplete";
import {SearchContext, SearchContextActions} from "../context/SearchContext";
import MyLocationButton from "../components/MyLocationButton";
import {ApiCoordinates} from "../../../shared/types/types";
import TransportationParams from "../components/TransportationParams";
import ImportantAddresses from "../components/ImportantAddresses";
import Input from "../components/Input";

const SearchParamsPage: React.FunctionComponent = () => {
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

    return (
        <DefaultLayout title="Umgebungsanalyse" withHorizontalPadding={true}>
            <h2>Standort</h2>
            <div className="sub-content grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationAutocomplete value={searchContextState.placesLocation} setValue={() => {
                }} afterChange={onLocationAutocompleteChange}/>
                <div className="flex flex-wrap items-end gap-4">
                    <Input label="Lat" type="text"
                           readOnly={true}
                           value={searchContextState.location?.lat || '-'}
                           className="input input-bordered w-full"
                           placeholder="Latitude" />
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
        </DefaultLayout>
    )
}

export default SearchParamsPage;
