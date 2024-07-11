import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  TPoiGroupName,
} from "../../../shared/types/types";
import { osmEntityTypes } from "../../../shared/constants/osm-entity-types";
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

  // TODO a hack - 'label' should not be used
  const handleEntityGroupChange = (groupName: TPoiGroupName): void => {
    let updatedEntities!: ApiOsmEntity[];

    if (
      values.some(
        ({ groupName: locParamsGrpName, label }) =>
          locParamsGrpName === groupName ||
          osmEntityMapper.getByGroupName(groupName)[0]?.label === label
      )
    ) {
      updatedEntities = values.filter(
        ({ groupName: locParamsGrpName, label }) =>
          locParamsGrpName
            ? locParamsGrpName !== groupName
            : osmEntityMapper.getByGroupName(groupName)[0]?.label !== label
      );
    }

    if (!updatedEntities) {
      const foundOet = osmEntityTypes.filter(
        ({ groupName: oetGroupName }) => oetGroupName === groupName
      );

      updatedEntities = foundOet.length ? [...values, ...foundOet] : values;
    }

    saveLocalityParams(updatedEntities);
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
          {/* TODO a hack - 'label' should not be used */}
          {Array.from(osmEntityMapper.getGroupNameMapping())
            .filter(
              ([, osmEntities]) =>
                Array.from(osmEntities)[0]?.category === category
            )
            .map(([groupName, osmEntities]) => {
              const label = Array.from(osmEntities)[0]?.label;

              return (
                <label
                  className="cursor-pointer label justify-start mt-2 pl-0"
                  key={`locality-${groupName}`}
                >
                  <input
                    type="checkbox"
                    checked={values.some(
                      ({
                        groupName: locParamsGrpName,
                        label: locParamsLabel,
                      }) =>
                        locParamsGrpName === groupName ||
                        locParamsLabel === label
                    )}
                    className="checkbox checkbox-primary checkbox-sm"
                    onChange={() => {
                      handleEntityGroupChange(groupName);
                    }}
                  />
                  <span className="label-text ml-2">
                    {/* TODO move translation to the poi hook */}
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
