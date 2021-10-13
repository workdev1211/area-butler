import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import React, {FunctionComponent, useContext, useState} from "react";
import "./LocationAutocomplete.css";
import {ConfigContext} from "../context/ConfigContext";
import {deriveGeocodeByAddress} from "../shared/shared.functions";

export interface LocationAutocompleteProps {
    afterChange?: ({value, coordinates}: { value: any, coordinates?: any }) => void;
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
        if (value) {
            const coordinates = await deriveGeocodeByAddress(value.label);
            afterChange({value, coordinates});
        }
        setValue(value);
    };

    if (!googleApiKey) {
        return <div>Missing google api key</div>
    }

    return (
        <div className={focus ? 'form-control w-full focus' : 'form-control w-full'}>
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
                        loadingMessage: () => 'Suche...',
                        onFocus: () => setFocus(true),
                        onBlur: () => setFocus(false),
                        defaultValue: ''
                    }}
                    apiKey={googleApiKey}
                />
            </div>
        </div>
    );
};

export default LocationAutocomplete;
