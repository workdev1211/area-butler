import { FC, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { components } from "react-select";

import "./LocationAutocomplete.scss";

import {
  deriveGeocodeByAddress,
  deriveGeocodeByPlaceId,
} from "../shared/shared.functions";
import poweredByGoogleIcon from "../assets/img/powered_by_google_on_white_hdpi.png";
import { googleMapsApiOptions } from "../shared/shared.constants";
import { useTools } from "../hooks/tools";
import { useGoogleMapsApi } from "../hooks/google";
import { LoadingMessage } from "./Loading";

interface ILocationAutocompleteProps {
  afterChange?: ({
    value,
    coordinates,
  }: {
    value: any;
    coordinates?: any;
  }) => void;
  value: any;
  setValue: any;
  menuZIndex?: number;
}

const Menu = (props: any) => {
  return (
    <components.Menu {...props}>
      {props.children}
      <div className="powered-container">
        <img src={poweredByGoogleIcon} alt="google-icon" />
      </div>
    </components.Menu>
  );
};

const LocationAutocomplete: FC<ILocationAutocompleteProps> = ({
  afterChange = () => {},
  value = null,
  setValue = () => {},
  menuZIndex = 99,
}) => {
  const isLoadedGoogleMapsApi = useGoogleMapsApi();
  const { getActualUser } = useTools();
  const user = getActualUser();

  const [inputValue, setInputValue] = useState(value?.label || "");
  const [focus, setFocus] = useState(false);

  if (!isLoadedGoogleMapsApi) {
    return <LoadingMessage />;
  }

  const deriveLangLat = async (value: any): Promise<void> => {
    if (value) {
      const coordinates = value?.value?.place_id
        ? await deriveGeocodeByPlaceId(user, value.value.place_id)
        : await deriveGeocodeByAddress(user, value.label);

      afterChange({ value, coordinates });
    }

    setValue(value);
    setInputValue("");
  };

  const onInputChange = (v: string, action: string): void => {
    if (action === "input-change") {
      setInputValue(v);
    }

    if (action === "menu-close") {
      setInputValue("");
    }
  };

  const deriveValue = (value?: any): any => {
    if (!value) {
      return null;
    }

    return value.value?.place_id
      ? value
      : { label: value, value: { place_id: "123" } };
  };

  const selectValue = deriveValue(value);

  return (
    <div
      className={focus ? "form-control w-full focus" : "form-control w-full"}
    >
      <label className="label">
        <span>Adresse</span>
      </label>
      <div
        className="google-input"
        onClick={() =>
          !!value && !inputValue && setInputValue(value?.label || value)
        }
      >
        <GooglePlacesAutocomplete
          apiOptions={googleMapsApiOptions}
          minLengthAutocomplete={5}
          selectProps={{
            components: {
              Menu,
            },
            value: selectValue,
            inputValue: inputValue,
            onInputChange: (v: any, { action }: any) =>
              onInputChange(v, action),
            onChange: deriveLangLat,
            className: "google-autocomplete",
            classNamePrefix: "google-autocomplete",
            placeholder: "Adresse eingeben",
            noOptionsMessage: () => "Keine Ergebnisse",
            loadingMessage: () => "Suche...",
            onFocus: () => setFocus(true),
            onBlur: () => setFocus(false),
            menuPortalTarget: document.body,
            styles: {
              menuPortal: (base: any) => ({ ...base, zIndex: menuZIndex }),
            },
          }}
        />
      </div>
    </div>
  );
};

export default LocationAutocomplete;
