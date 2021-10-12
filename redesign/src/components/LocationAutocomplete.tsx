import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import React, {FunctionComponent, useContext, useState} from "react";
import {ConfigContext} from "../../../frontend/src/context/ConfigContext";
import {deriveGeocodeByAddress} from "../../../frontend/src/shared/shared.functions";
import "./LocationAutocomplete.css";

export interface LocationAutocompleteProps {
    afterChange?: ({value, coordinates}: { value: any, coordinates: any }) => void;
    value: any;
    setValue: any;
}

const LocationAutocomplete: FunctionComponent<LocationAutocompleteProps> = ({
                                                                                afterChange = () => {
                                                                                },
                                                                                value = null,
                                                                                setValue = () => {
                                                                                }
                                                                            }) => {

    const {googleApiKey} = useContext(ConfigContext);

    const [focus, setFocus] = useState(false);

    const deriveLangLat = async (value: any) => {
        const coordinates = await deriveGeocodeByAddress(value.label);
        setValue(value);
        afterChange({value, coordinates});
    };

    return (
        <div className={focus ? 'form-control focus' : 'form-control'}>
            <label className="label">
                <span>Adresse</span>
            </label>
            <div className="google-input">
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
                        className: 'google-autocomplete',
                        classNamePrefix: 'google-autocomplete',
                        placeholder: 'Adresse eingeben',
                        noOptionsMessage: () => 'Keine Ergebnisse',
                        isClearable: true,
                        onFocus: () => setFocus(true),
                        onBlur: () => setFocus(false)
                    }}
                    apiKey={googleApiKey}
                />
            </div>
        </div>
    );
};

export default LocationAutocomplete;
