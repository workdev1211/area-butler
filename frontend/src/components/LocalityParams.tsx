import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  TPoiGroupName,
} from "../../../shared/types/types";
import { OsmEntityMapper } from "../../../shared/types/osm-entity-mapper";

interface ILocalityParamsProps {
  values: ApiOsmEntity[];
  onChange: (newValues: ApiOsmEntity[]) => void;
}

const LocalityParams: FC<ILocalityParamsProps> = ({ values, onChange }) => {
  const { t } = useTranslation();
  const osmEntityMapper = new OsmEntityMapper();

  const saveLocalityParams = (updatedEntities: ApiOsmEntity[]) => {
    onChange(updatedEntities);
  };

  const handleEntityGroupChange = (groupName: TPoiGroupName): void => {
    const entitiesByGroupName = osmEntityMapper.getByGroupName(groupName);
    let updatedEntities!: ApiOsmEntity[];

    if (
      values.some(
        ({ groupName: locParamsGroupName }) => locParamsGroupName === groupName
      )
    ) {
      updatedEntities = values.filter(
        ({ groupName: locParamsGroupName }) => locParamsGroupName !== groupName
      );
    }

    if (!updatedEntities) {
      updatedEntities = entitiesByGroupName.length
        ? [...values, ...entitiesByGroupName]
        : values;
    }

    saveLocalityParams(updatedEntities);
  };

  const handleEntityCategoryChange = (category: ApiOsmEntityCategory) => {
    const updatedEntities: ApiOsmEntity[] = values.some(
      (value) => value.category === category
    )
      ? values.filter((value) => value.category !== category)
      : [...values, ...osmEntityMapper.getByCategory(category)];

    saveLocalityParams(updatedEntities);
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
          {Array.from(osmEntityMapper.getGroupNameMapping())
            .filter(([, osmEntities]) =>
              Array.from(osmEntities).every(
                ({ category: entityCategory }) => entityCategory === category
              )
            )
            .map(([groupName]) => {
              return (
                <label
                  className="cursor-pointer label justify-start mt-2 pl-0"
                  key={`locality-${groupName}`}
                >
                  <input
                    type="checkbox"
                    checked={values.some(
                      ({ groupName: locParamsGroupName }) =>
                        locParamsGroupName === groupName
                    )}
                    className="checkbox checkbox-primary checkbox-sm"
                    onChange={() => {
                      handleEntityGroupChange(groupName);
                    }}
                  />
                  <span className="label-text ml-2">
                    {t(
                      (
                        IntlKeys.snapshotEditor.pointsOfInterest as Record<
                          string,
                          string
                        >
                      )[groupName]
                    )}
                  </span>
                </label>
              );
            })}
        </div>
      ))}
    </div>
  );
};

export default LocalityParams;
