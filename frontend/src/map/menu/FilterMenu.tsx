import { FunctionComponent, useEffect, useState } from "react";

import "./FilterMenu.scss";

import {
  LocIndexPropsEnum,
  TApiLocIndexProps,
} from "../../../../shared/types/location-index";
import { locationIndexNames } from "../../../../shared/constants/location-index";
import { EntityGroup } from "../../shared/search-result.types";
import { realEstateListingsTitle } from "../../../../shared/constants/real-estate";

interface IFilterMenuProps {
  isFilterMenuOpen: boolean;
  isEditorMode: boolean;
  groupEntities: EntityGroup[];
  setGroupEntities: (groupEntities: EntityGroup[]) => void;
}

const locIndexProps = Object.values(LocIndexPropsEnum);

const initLocIndexValues = locIndexProps.reduce<TApiLocIndexProps>(
  (result, locIndex) => {
    result[locIndex] = 0;
    return result;
  },
  {} as TApiLocIndexProps
);

const FilterMenu: FunctionComponent<IFilterMenuProps> = ({
  isFilterMenuOpen,
  isEditorMode,
  groupEntities,
  setGroupEntities,
}) => {
  const [locIndexValues, setLocIndexValues] = useState(initLocIndexValues);

  useEffect(() => {
    const realEstateGroup = groupEntities.find(
      ({ title }) => title === realEstateListingsTitle
    );

    if (!realEstateGroup) {
      return;
    }

    realEstateGroup.items = realEstateGroup.items.map((item) => {
      const itemLocIndices = item.realEstateData?.locationIndices;

      if (!itemLocIndices) {
        item.isFiltered = false;
        return item;
      }

      const isNotFiltered = Object.values(LocIndexPropsEnum).every((locIndex) =>
        itemLocIndices[locIndex]
          ? itemLocIndices[locIndex] >= locIndexValues[locIndex]
          : true
      );

      item.isFiltered = !isNotFiltered;

      return item;
    });

    setGroupEntities(JSON.parse(JSON.stringify(groupEntities)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locIndexValues]);

  return (
    <div
      className={`filter-menu ${isFilterMenuOpen ? "filter-menu-open" : ""}`}
    >
      <div
        className="filter-menu-header bg-primary-gradient"
        style={{ height: `${isEditorMode ? 112 : 56}px` }}
      >
        <div
          className="filter-menu-header-text"
          style={{
            height: `${isEditorMode ? "calc(67px + 0.5rem + 1rem)" : "auto"}`,
          }}
        >
          Bedürfnisfilter
        </div>
      </div>
      <div
        className="filter-menu-content"
        style={{ height: `calc(100% - ${isEditorMode ? 112 : 56}px)` }}
      >
        {locIndexProps.map((locIndex) => (
          <div
            key={locIndex}
            className="flex flex-col gap-0.5 py-1 pl-[12px]"
            style={{ borderBottom: "0.125rem solid darkgray" }}
          >
            <label className="text-lg font-bold">
              {locationIndexNames[locIndex]}
            </label>
            <div className="flex gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={locIndexValues[locIndex]}
                onChange={({ target: { value } }) => {
                  setLocIndexValues({ ...locIndexValues, [locIndex]: value });
                }}
              />
              <div
                className="flex justify-end px-2 text-lg text-white font-bold"
                style={{ borderRadius: "15%", backgroundColor: "#007960" }}
              >
                {locIndexValues[locIndex]} %
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterMenu;
