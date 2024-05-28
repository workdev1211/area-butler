import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import Input from "./inputs/formik/Input";
import typeIcon from "../assets/icons/icons-16-x-16-outline-ic-type.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import LocationAutocomplete from "./LocationAutocomplete";

interface IImportantAddressesProps {
  inputValues?: ApiPreferredLocation[];
  onChange?: (preferredLocations: ApiPreferredLocation[]) => void;
}

const ImportantAddresses: FunctionComponent<IImportantAddressesProps> = ({
  inputValues = [],
  onChange = () => {},
}) => {
  const { t } = useTranslation();
  const addAddress = () => {
    const newEntry: ApiPreferredLocation = {
      title: "",
      address: "",
    };

    onChange([...inputValues, newEntry]);
  };

  const removeAddress = (index: number) => {
    onChange(inputValues.filter((_, i) => index !== i));
  };

  const changeTitle = (title: string, index: number) => {
    const updatedEntries = inputValues?.map((location, indexLocation) =>
      index !== indexLocation
        ? location
        : {
            ...location,
            title,
          }
    );

    onChange([...updatedEntries]);
  };

  const onLocationAutocompleteChange = (payload: any, index: number) => {
    const updatedEntries = inputValues?.map((location, indexLocation) =>
      index !== indexLocation
        ? location
        : {
            ...location,
            address: payload.value.label,
            coordinates: payload.coordinates,
          }
    );

    onChange([...updatedEntries]);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-4 items-start">
      {inputValues?.map((location, index) => (
        <div
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
          key={`important-address-${index}`}
        >
          <Input
            label={t(IntlKeys.environmentalAnalysis.designation)}
            icon={typeIcon}
            className="input input-bordered flex"
            name={`description-${index}`}
            list="suggestedTitles"
            value={location.title}
            onChange={(event) => {
              changeTitle(event.target.value, index);
            }}
          />
          <div className="flex col-span-1 md:col-span-2 2xl:col-span-1">
            <LocationAutocomplete
              value={location.address}
              afterChange={(payload) => {
                onLocationAutocompleteChange(payload, index);
              }}
            />
            <div className="flex items-end px-4 pb-4">
              <img
                src={deleteIcon}
                className="w-6 h-6 cursor-pointer"
                alt="icon-delete"
                onClick={() => {
                  removeAddress(index);
                }}
              />
            </div>
          </div>
        </div>
      ))}
      {inputValues?.length < 4 && (
        <button
          data-tour="add-important-address"
          type="button"
          onClick={() => {
            addAddress();
          }}
          className="btn btn-link text-primary"
        >
          + {t(IntlKeys.environmentalAnalysis.addAddress)}
        </button>
      )}
      <datalist id="suggestedTitles">
        <option value={t(IntlKeys.environmentalAnalysis.airport)} />
        <option value={t(IntlKeys.environmentalAnalysis.station)} />
        <option value={t(IntlKeys.environmentalAnalysis.shuttleRoute)} />
        <option value={t(IntlKeys.environmentalAnalysis.highlightOfRegion)} />
        <option value={t(IntlKeys.environmentalAnalysis.ownDesignation)} />
      </datalist>
    </div>
  );
};

export default ImportantAddresses;
