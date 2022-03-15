import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {components} from "react-select";
import React, {FunctionComponent, useContext, useState} from "react";
import "./LocationAutocomplete.css";
import {ConfigContext} from "../context/ConfigContext";
import {deriveGeocodeByAddress, deriveGeocodeByPlaceId} from "../shared/shared.functions";
import poweredByGoogleIcon from "../assets/img/powered_by_google_on_white_hdpi.png";

export interface LocationAutocompleteProps {
    afterChange?: ({value, coordinates}: { value: any, coordinates?: any }) => void;
    value: any;
    setValue: any;
    menuZIndex?: number
}

const LocationAutocomplete: FunctionComponent<LocationAutocompleteProps> = ({
                                                                                afterChange = () => {
                                                                                },
                                                                                value = null,
                                                                                setValue = () => {
                                                                                },
                                                                                menuZIndex = 99
                                                                            }) => {
    const {googleApiKey} = useContext(ConfigContext);
    const Menu = (props: any) => {
        return (
            <>
                <components.Menu {...props}>
                    {props.children}
                    <div className="powered-container">
                        <img src={poweredByGoogleIcon} alt="google-icon"/>
                    </div>
                </components.Menu>
            </>
        );
    };

    const [inputValue, setInputValue] = useState(value?.label || '');

    const [focus, setFocus] = useState(false);

    const deriveLangLat = async (value: any) => {
        console.log(value);
        if (value) {
            const coordinates = value?.value?.place_id ? await deriveGeocodeByPlaceId(value.value.place_id) : await deriveGeocodeByAddress(value.label);
            afterChange({value, coordinates});
        }
        setValue(value);
        setInputValue('');
    };

    if (!googleApiKey) {
        return <div>Missing google api key</div>
    }

    const onInputChange = (v: string, action: string) => {
        if (action === 'input-change') {
            setInputValue(v);
        }
        if (action === 'menu-close') {
            setInputValue('');
        }
    };

    const deriveValue = (value?: any) => {
        if (value) {
            if (value.value?.place_id) {
                return value;
            }
            return {label: value, value: {place_id: '123'}}
        }
        return null;
    }
    const selectValue = deriveValue(value);

    return (
        <div className={focus ? 'form-control w-full focus' : 'form-control w-full'}>
            <label className="label">
                <span>Adresse</span>
            </label>
            <div className="google-input"
                 onClick={() => !!value && !inputValue && setInputValue(value?.label || value)}>
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
                        components: {
                            Menu,
                        },
                        value: selectValue,
                        inputValue: inputValue,
                        onInputChange: (v: any, {action}: any) => onInputChange(v, action),
                        onChange: deriveLangLat,
                        className: 'google-autocomplete',
                        classNamePrefix: 'google-autocomplete',
                        placeholder: 'Adresse eingeben',
                        noOptionsMessage: () => 'Keine Ergebnisse',
                        loadingMessage: () => 'Suche...',
                        onFocus: () => setFocus(true),
                        onBlur: () => setFocus(false),
                        menuPortalTarget: document.body,
                        styles: {menuPortal: (base: any) => ({...base, zIndex: menuZIndex})}
                    }}
                    apiKey={googleApiKey}
                />
            </div>
        </div>
    );
};

export default LocationAutocomplete;
