import {ApiOsmEntity, ApiOsmEntityCategory} from "../../../shared/types/types";
import React from "react";
import {osmEntityTypes} from "../../../shared/constants/constants";

export interface LocalityParamsProps {
    values: ApiOsmEntity[];
    onChange: (newValues: ApiOsmEntity[]) => void;
}

const LocalityParams: React.FunctionComponent<LocalityParamsProps> = ({values, onChange}) => {

    const handleChange = (entity: ApiOsmEntity) => {
        const updatedEntities: ApiOsmEntity[] = values.some(value => value.name === entity.name) ? values.filter(value => value.name !== entity.name) : [
            ...values,
            entity
        ]
        onChange(updatedEntities);
    }

    return (
        <div className="flex flex-wrap gap-12 lg:gap-24 w-full">
            {Object.values(ApiOsmEntityCategory).map(category => <div className="flex flex-col">
                <h3>{category}</h3>
                {osmEntityTypes.filter(entityType => entityType.category === category).map(entity =>
                    <label className="cursor-pointer label justify-start mt-2 pl-0">
                        <input type="checkbox" checked={values.includes(entity)} className="checkbox checkbox-primary checkbox-sm" onChange={() => handleChange(entity)}/>
                        <span className="label-text ml-2">{entity.label}</span>
                    </label>)}
            </div>)}
        </div>
    )
}
export default LocalityParams;
