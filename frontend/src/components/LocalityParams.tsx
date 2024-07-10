import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
} from "../../../shared/types/types";
import { osmEntityTypes } from "../../../shared/constants/constants";

interface ILocalityParamsProps {
  values: ApiOsmEntity[];
  onChange: (newValues: ApiOsmEntity[]) => void;
}

const LocalityParams: FC<ILocalityParamsProps> = ({ values, onChange }) => {
  const { t } = useTranslation();
  const handleEntityChange = (entity: ApiOsmEntity) => {
    const updatedEntities: ApiOsmEntity[] = values.some(
      (value) => value.name === entity.name
    )
      ? values.filter((value) => value.name !== entity.name)
      : [...values, entity];

    onChange(updatedEntities);
  };

  const handleEntityCategoryChange = (category: ApiOsmEntityCategory) => {
    const updatedEntities: ApiOsmEntity[] = values.some(
      (value) => value.category === category
    )
      ? values.filter((value) => value.category !== category)
      : [
          ...values,
          ...osmEntityTypes.filter((type) => type.category === category),
        ];

    onChange(updatedEntities);
  };

  return (
    <div
      className="flex flex-wrap gap-12 lg:gap-24 w-full"
      data-tour="locality-params"
    >
      {Object.values(ApiOsmEntityCategory).map((category) => (
        <div className="flex flex-col" key={`category-${category}`}>
          <div>
            <label
              className="cursor-pointer label justify-start mt-2 pl-0"
              key={`locality-${category}`}
            >
              <input
                type="checkbox"
                checked={values.some((value) => value.category === category)}
                className="checkbox checkbox-primary checkbox-sm"
                onChange={() => {
                  handleEntityCategoryChange(category);
                }}
              />
              <h3
                className="label-text ml-2"
                style={{ padding: "16px 0 16px 0" }}
              >
                {t(IntlKeys.snapshotEditor.pointsOfInterest[category])}
              </h3>
            </label>
          </div>
          {/* TODO convert to reduce */}
          {osmEntityTypes
            .filter((entityType) => entityType.category === category)
            .map((entity) => (
              <label
                className="cursor-pointer label justify-start mt-2 pl-0"
                key={`locality-${entity.name}-${entity.label}`}
              >
                <input
                  type="checkbox"
                  checked={values.includes(entity)}
                  className="checkbox checkbox-primary checkbox-sm"
                  onChange={() => {
                    handleEntityChange(entity);
                  }}
                />
                <span className="label-text ml-2">
                  {t(
                    (
                      IntlKeys.snapshotEditor.pointsOfInterest as Record<
                        string,
                        string
                      >
                    )[entity.name]
                  )}
                </span>
              </label>
            ))}
        </div>
      ))}
    </div>
  );
};

export default LocalityParams;
