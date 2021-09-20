import React, {FunctionComponent, useEffect, useState} from "react";
import {OsmName} from "../../../shared/types/types";
import {osmEntityTypes} from "../../../shared/constants/constants";

export const localityOptionsDefaults = osmEntityTypes.filter(entity =>
    [
        OsmName.fuel, OsmName.park, OsmName.kiosk, OsmName.supermarket, OsmName.school, OsmName.restaurant
    ].includes(entity.name)).map((entity) => entity.name);

export interface LocalityOptionsProps {
    inputValues?: OsmName[]
    onChange?: (value: OsmName[]) => void
}

const LocalityOptions: FunctionComponent<LocalityOptionsProps> = ({
                                                                      inputValues = localityOptionsDefaults,
                                                                      onChange = () => {
                                                                      }
                                                                  }) => {
    const [localityOptions, setLocalityOptions] = useState<OsmName[]>(inputValues);

    const handleOnChange = (value: OsmName[]) => {
        setLocalityOptions([...value]);
        onChange([...value]);
    }

    useEffect( () => {
    setLocalityOptions([...inputValues]);
    }, [inputValues])

    return <>
        {
            osmEntityTypes.map((entity) => {
                const active = localityOptions.some((option) => option === entity.name);
                return (
                    <label className="flex items-center" key={entity.name}>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-xs checkbox-primary"
                            checked={active}
                            onChange={(e) => {
                                if (!active) {
                                    handleOnChange([...localityOptions, entity.name]);
                                } else {
                                    handleOnChange(
                                        localityOptions.filter((option) => option !== entity.name)
                                    );
                                }
                            }}
                        />
                        <span className="ml-2">{entity.label}</span>
                    </label>
                );
            })
        }
    </>
}

export default LocalityOptions;
