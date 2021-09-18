import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import React, {FunctionComponent, useContext, useState} from "react";
import {ConfigContext} from "../context/ConfigContext";
import {deriveGeocodeByAddress} from "../shared/shared.functions";
import {SearchContext, SearchContextActions} from "../context/SearchContext";

export interface LocationAutocompleteProps {
    afterChange?: () => void;
    value: any;
    setValue: any;
}

const LocationAutocomplete: FunctionComponent<LocationAutocompleteProps> = ({
                                                                                afterChange = () => {
                                                                                },
                                                                                value = null,
                                                                                setValue = () => {}
                                                                            }) => {

    const {googleApiKey} = useContext(ConfigContext);
    const {searchContextDispatch} = useContext(SearchContext);

    const deriveLangLat = async (value: any) => {
        const coordinates = await deriveGeocodeByAddress(value.label);
        searchContextDispatch({type: SearchContextActions.SET_PLACES_LOCATION, payload: value});
        searchContextDispatch({type: SearchContextActions.SET_LOCATION, payload: coordinates});
        setValue(value);
        afterChange();
    };

    return (
        <div className="col-span-2">
            <label className="label">
                <span>Adresse</span>
            </label>
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
                }}
                apiKey={googleApiKey}
            />
        </div>
    );
};

export default LocationAutocomplete;
