import { FC, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import "./FilterMenu.scss";

import {
  LocIndexPropsEnum,
  TApiLocIndexProps,
} from "../../../shared/types/location-index";
import { OsmName } from "../../../shared/types/types";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";

interface IFilterMenuProps {
  isFilterMenuOpen: boolean;
  isEditorMode: boolean;
}

const locIndexProps = Object.values(LocIndexPropsEnum);

const initLocIndexValues = locIndexProps.reduce<TApiLocIndexProps>(
  (result, locIndex) => {
    result[locIndex] = 0;
    return result;
  },
  {} as TApiLocIndexProps
);

const FilterMenu: FC<IFilterMenuProps> = ({
  isFilterMenuOpen,
  isEditorMode,
}) => {
  const {
    searchContextDispatch,
    searchContextState: { entityGroupsByActMeans },
  } = useContext(SearchContext);

  const { t } = useTranslation();
  const [locIndexValues, setLocIndexValues] = useState(initLocIndexValues);

  useEffect(() => {
    const realEstateGroup = entityGroupsByActMeans.find(
      ({ name }) => name === OsmName.property
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

    searchContextDispatch({
      type: SearchContextActionTypes.SET_ENT_GROUPS_BY_ACT_MEANS,
      payload: entityGroupsByActMeans,
    });

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
          {t(IntlKeys.snapshotEditor.needsFilter)}
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
              {t(
                (
                  IntlKeys.snapshotEditor.positionIndices as Record<
                    string,
                    string
                  >
                )[locIndex]
              )}
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
