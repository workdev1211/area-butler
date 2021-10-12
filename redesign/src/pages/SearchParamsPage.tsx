import React, {useContext, useState} from "react";
import DefaultLayout from "../layout/defaultLayout";
import LocationAutocomplete from "../components/LocationAutocomplete";
import {SearchContext, SearchContextActions} from "../context/SearchContext";
import positionIcon from "../assets/icons/icons-16-x-16-outline-ic-position.svg"

const SearchParamsPage: React.FunctionComponent = () => {
    const {searchContextState, searchContextDispatch} = useContext(SearchContext);
    const [placesValue, setPlacesValues] = useState<{label:string, value: any} | null>(null);

    const onLocationAutocompleteChange = (payload: any) => {
        searchContextDispatch({type: SearchContextActions.SET_PLACES_LOCATION, payload: payload.value});
        searchContextDispatch({type: SearchContextActions.SET_LOCATION, payload: payload.coordinates});
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
                        type: SearchContextActions.SET_PLACES_LOCATION
                    })
                    setLocationBusy(false);
                },
                (error: any) => setLocationBusy(false)
            );
        }
    };
    const MyLocationButton: React.FunctionComponent = () => {
        const baseClasses = 'btn bg-primary-gradient';
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
            <div className="sub-content grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocationAutocomplete value={placesValue} setValue={setPlacesValues} afterChange={onLocationAutocompleteChange} />
                <div className="flex items-end gap-4">
                    <div className="form-control flex-1">
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
                    <div className="form-control flex-1">
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
                    <MyLocationButton />
                </div>
            </div>
        </DefaultLayout>
    )
}

export default SearchParamsPage;
