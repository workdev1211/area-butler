import { ComponentType, FC, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {
  components,
  ControlProps,
  CSSObjectWithLabel,
  GroupBase,
  MenuProps,
  StylesConfig,
} from "react-select";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  deriveGeocodeByAddress,
  deriveGeocodeByPlaceId,
} from "../shared/shared.functions";
import PoweredByGoogleIcon from "../assets/img/powered_by_google_on_white_hdpi.png";
import LocationIcon from "../assets/icons/icons-16-x-16-outline-ic-location.svg";
import { googleMapsApiOptions } from "../shared/shared.constants";
import { useGoogleMapsApi } from "../hooks/google";
import { LoadingMessage } from "./Loading";
import { ApiCoordinates } from "../../../shared/types/types";
import { useUserState } from "../hooks/userstate";

export interface IOnLocAutoChangeProps {
  value: any;
  coordinates?: ApiCoordinates;
  isError?: boolean;
}

interface ISelectOption {
  label: string;
  value: { place_id: string };
}

interface ILocationAutocompleteProps {
  afterChange: (locAutoChangeProps: IOnLocAutoChangeProps) => void;
  value: any;
  menuZIndex?: number;
}

const Control: ComponentType<
  ControlProps<ISelectOption, false, GroupBase<ISelectOption>>
> = ({ children, ...props }) => (
  <components.Control {...props}>
    <img className="w-5 h-5 ml-5" src={LocationIcon} alt="location" />
    {children}
  </components.Control>
);

const Menu: ComponentType<
  MenuProps<ISelectOption, false, GroupBase<ISelectOption>>
> = ({ children, ...props }) => (
  <components.Menu {...props}>
    {children}
    <img
      className="self-end h-4 my-1 mr-2"
      src={PoweredByGoogleIcon}
      alt="google"
    />
  </components.Menu>
);

const LocationAutocomplete: FC<ILocationAutocompleteProps> = ({
  afterChange = () => {},
  value = null,
  menuZIndex = 99,
}) => {
  const { t } = useTranslation();
  const isLoadedGoogleMapsApi = useGoogleMapsApi();
  const { getCurrentUser } = useUserState();
  const user = getCurrentUser();

  const [inputValue, setInputValue] = useState<string>();
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    setInputValue(value?.label || "");
  }, [value]);

  if (!isLoadedGoogleMapsApi) {
    return <LoadingMessage />;
  }

  const deriveLangLat = async (value: any): Promise<void> => {
    if (!value) {
      setInputValue("");
      return;
    }

    try {
      const coordinates = value?.value?.place_id
        ? await deriveGeocodeByPlaceId(user, value.value.place_id)
        : await deriveGeocodeByAddress(user, value.label);

      afterChange({ value, coordinates });
    } catch {
      afterChange({ value, isError: true });
    }

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

  const deriveValue = (value?: any): ISelectOption | undefined => {
    if (!value) {
      return;
    }

    return value.value?.place_id
      ? value
      : { label: value, value: { place_id: "123" } };
  };

  const selectedValue = deriveValue(value);

  const customStyles: StylesConfig<
    ISelectOption,
    false,
    GroupBase<ISelectOption>
  > = {
    control: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      border: "1px solid var(--base-bright-silver)",
      boxShadow: "none",
      ":hover": {
        border: "1px solid var(--primary)",
      },
      ":focus": {
        border: "1px solid var(--primary)",
      },
    }),
    menu: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      zIndex: 9999,
    }),
    menuList: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      zIndex: menuZIndex,
    }),
    option: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      zIndex: 9999,
    }),
    valueContainer: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      color: "var(--base-anthracite)",
    }),
  };

  return (
    <div
      className={`form-control w-full${isFocus ? " focus:text-primary" : ""}`}
    >
      <label className="label">
        <span>{t(IntlKeys.common.address)}</span>
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
              Control,
              Menu,
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            },
            value: selectedValue,
            inputValue: inputValue,
            onInputChange: (v: any, { action }: any) =>
              onInputChange(v, action),
            onChange: deriveLangLat,
            className: "google-autocomplete",
            classNamePrefix: "google-autocomplete",
            placeholder: t(IntlKeys.googleAutocomplete.enterAddress),
            noOptionsMessage: () => t(IntlKeys.common.noResults),
            loadingMessage: () => t(IntlKeys.common.searching),
            onFocus: () => setIsFocus(true),
            onBlur: () => setIsFocus(false),
            menuPortalTarget: document.body,
            styles: customStyles,
            classNames: {
              control: () => "flex items-center h-[48px] rounded-lg",
              menu: () => "flex flex-col",
            },
          }}
        />
      </div>
    </div>
  );
};

export default LocationAutocomplete;
