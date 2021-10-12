import React, {useState} from "react";
import DefaultLayout from "../layout/defaultLayout";
import LocationAutocomplete from "../components/LocationAutocomplete";

const SearchParamsPage: React.FunctionComponent = () => {
    const [placesValue, setPlacesValues] = useState<{label:string, value: any} | null>(null);

    const onLocationAutocompleteChange = (payload: any) => {
        console.log(payload)
    }

    return (
        <DefaultLayout title="Standortanalyse" withHorizontalPadding={true}>
            <h2>Standort ermitteln</h2>
            <div className="sub-content grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocationAutocomplete value={placesValue} setValue={setPlacesValues} afterChange={onLocationAutocompleteChange} />
                <div className="flex gap-4">
                    <div className="form-control flex-1">
                        <label className="label">
                            <span>Lat</span>
                        </label>
                        <input
                            type="text"
                            value=""
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
                            value=""
                            className="input input-bordered w-full"
                            placeholder="Longitude"
                        />
                    </div>
                </div>
            </div>
        </DefaultLayout>
    )
}

export default SearchParamsPage;
