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
    const [inputValue, setInputValue] = useState(value || '');

    const [focus, setFocus] = useState(false);

    const deriveLangLat = async (value: any) => {
        if (value) {
            const coordinates = await deriveGeocodeByAddress(value.label);
            afterChange({value, coordinates});
        }
        setValue(value);
        setInputValue(null);
    };

    if (!googleApiKey) {
        return <div>Missing google api key</div>
    }

    const onInputChange = (v: string, action: string) => {
        if (action === 'input-change') {
            setInputValue(v);
        }
        if (action === 'menu-close') {
            setInputValue(null);
        }
    };

    const deriveValue = (value?: any) => {
        if (value) {
            if (value.value?.place_id) {
                return value;
            }
            return { label: value, value: { place_id: '123' }}
        }
        return null;
    }
    const selectValue = deriveValue(value);

    return (
        <div className={focus ? 'form-control w-full focus' : 'form-control w-full'}>
            <label className="label">
                <span>Adresse</span>
            </label>
            <div className="google-input" onClick={() => !!value && !inputValue && setInputValue(value.label)}>
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
                        value: selectValue,
                        inputValue: inputValue,
                        onInputChange: (v: any, {action} : any) => onInputChange(v, action),
                        onChange: deriveLangLat,
                        className: 'google-autocomplete',
                        classNamePrefix: 'google-autocomplete',
                        placeholder: 'Adresse eingeben',
                        noOptionsMessage: () => 'Keine Ergebnisse',
                        loadingMessage: () => 'Suche...',
                        onFocus: () => setFocus(true),
                        onBlur: () => setFocus(false),
                        menuPortalTarget: document.body,
                        styles: { menuPortal: (base: any) => ({ ...base, zIndex: 99 }) }
                    }}
                    apiKey={googleApiKey}
                />
            </div>
        </div>
    );
};

export default LocationAutocomplete;
