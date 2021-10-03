import { ConfigContext } from "context/ConfigContext";
import { useContext, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { deriveGeocodeByAddress } from "shared/shared.functions";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { PotentialCustomerDropDown } from "./PotentialCustomerDropDown";

export interface PreferredLocationsProps {
  showImportantLocations?: boolean;
  inputValues?: ApiPreferredLocation[];
  onChange?: (preferredLocations: ApiPreferredLocation[]) => void;
}

export const PreferredLocationsControl: React.FunctionComponent<PreferredLocationsProps> =
  ({
    showImportantLocations = false,
    inputValues = [],
    onChange = () => {},
  }) => {
    const [preferredLocations, setPreferredLocations] = useState(inputValues);

    useEffect(() => {
      setPreferredLocations([...inputValues]);
    }, [JSON.stringify(inputValues)]);

    const { googleApiKey } = useContext(ConfigContext);

    return (
      <div className="flex flex-col gap-6">
        {preferredLocations.map((preferredLocation, index) => (
          <div className="flex gap-6 items-center">
            <div className="flex flex-grow flex-col gap-3">
              <div className="form-control">
                <label className="label-text">Bezeichnung</label>
                <input
                  className="input input-bordered"
                  placeholder="Bezeichnung"
                  value={preferredLocation.title}
                  list="preferredLocationTitles"
                  onChange={(event) => {
                    const newLocations = [...preferredLocations];
                    newLocations[index].title = event.target.value;
                    setPreferredLocations(newLocations);
                    onChange(newLocations);
                  }}
                ></input>
              </div>
              <div className="form-control">
                <label className="label-text">
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
                  selectProps={{
                    value: {
                      label: preferredLocation.address,
                      value: {
                        place_id: null,
                        description: preferredLocation.address,
                      },
                    },
                    onChange: async (value: any) => {
                      const newLocations = [...preferredLocations];
                      const { lat, lng } = await deriveGeocodeByAddress(
                        value.label
                      );
                      newLocations[index].address = value.label;
                      newLocations[index].coordinates = { lat, lng };
                      setPreferredLocations(newLocations);
                      onChange(newLocations);
                    },
                  }}
                  minLengthAutocomplete={5}
                  apiKey={googleApiKey}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-xs my-10 rounded-full"
              onClick={() => {
                const newLocations = [...preferredLocations];
                newLocations.splice(index, 1);
                setPreferredLocations(newLocations);
                onChange(newLocations);
              }}
            >
              -
            </button>
          </div>
        ))}
        <datalist id="preferredLocationTitles">
          <option value="Arbeitsort"></option>
          <option value="Eltern"></option>
          <option value="Kita"></option>
          <option value="Schule"></option>
          <option value="Schwiegereltern"></option>
          <option value="Eigene Bezeichnung"></option>
        </datalist>

        <div className="flex gap-3 items-end">
          {preferredLocations.length < 4 && (
            <button
              className="btn btn-xs w-40"
              type="button"
              onClick={() => {
                const locations = [
                  ...preferredLocations,
                  { title: "", address: "" },
                ];
                setPreferredLocations(locations);
                onChange(locations);
              }}
            >
              Weitere Adresse
            </button>
          )}
          {showImportantLocations && (
            <PotentialCustomerDropDown buttonStyles="btn btn-xs" menuOrientation="dropdown-top"
            ></PotentialCustomerDropDown>
          )}
        </div>
      </div>
    );
  };
