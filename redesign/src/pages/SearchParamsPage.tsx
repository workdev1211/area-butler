import React, {useContext, useState} from "react";
import DefaultLayout from "../layout/defaultLayout";
import LocationAutocomplete from "../components/LocationAutocomplete";
import {SearchContext, SearchContextActions} from "../context/SearchContext";
import positionIcon from "../assets/icons/icons-16-x-16-outline-ic-position.svg"

const SearchParamsPage: React.FunctionComponent = () => {
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);

    const onLocationAutocompleteChange = (payload: any) => {
        searchContextDispatch({type: SearchContextActions.SET_PLACES_LOCATION, payload: payload.value});
        if (payload.coordinates) {
            searchContextDispatch({type: SearchContextActions.SET_LOCATION, payload: payload.coordinates});
        }
    }

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
                        type: SearchContextActions.SET_PLACES_LOCATION,
                        payload: { label: 'Mein Standort'}
                    })
                    setLocationBusy(false);
                },
                (error: any) => setLocationBusy(false)
            );
        }
    };
    const MyLocationButton: React.FunctionComponent = () => {
        const baseClasses = 'btn bg-primary-gradient w-full sm:w-auto';
        return (
            <button
                type="button"
                disabled={locationBusy}
                onClick={locateUser}
                className={locationBusy ? baseClasses + ' loading' : baseClasses}
            >
                Aktueller Standort <img className="ml-1 -mt-0.5" src={positionIcon} alt="icon-position"/>
            </button>
        )
    }


    return (
        <DefaultLayout title="Umgebungsanalyse" withHorizontalPadding={true}>
            <h2>Standort</h2>
            <div className="sub-content grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationAutocomplete value={searchContextState.placesLocation} setValue={() => {}}
                                      afterChange={onLocationAutocompleteChange}/>
                <div className="flex flex-wrap items-end gap-4">
                        <div className="form-control min-flex">
                            <label className="label">
                                <span>Lat</span>
                            </label>
                            <input
                                type="text"
                                readOnly={true}
                                value={searchContextState.location?.lat || '-'}
                                className="input input-bordered w-full"
                                placeholder="Latitude"
                            />
                        </div>
                        <div className="form-control min-flex">
                            <label className="label">
                                <span>Long</span>
                            </label>
                            <input
                                type="text"
                                readOnly={true}
                                value={searchContextState.location?.lng || '-'}
                                className="input input-bordered w-full"
                                placeholder="Longitude"
                            />
                        </div>
                    <MyLocationButton/>
                </div>
            </div>
        </DefaultLayout>
    )
}

export default SearchParamsPage;
