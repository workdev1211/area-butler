import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import OnePageLegendIcon from "../../OnePageLegendIcon";
import { distanceToHumanReadable } from "../../../../shared/shared.functions";
import { truncateText } from "../../../../../../shared/functions/shared.functions";
import { poiNameMaxLength } from "../../../../shared/shared.constants";
import { ISortableEntityGroup } from "../../OnePageExportModal";

interface IOnePagePoiListProps {
  filteredGroups: ISortableEntityGroup[];
}

const OnePagePoiList: FC<IOnePagePoiListProps> = ({ filteredGroups }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-2xl font-bold">
        {t(IntlKeys.snapshotEditor.exportTab.overview)}
      </div>
      <div className="flex gap-3 flex-wrap">
        {filteredGroups.map((group) => {
          return (
            <div
              className="flex flex-col gap-1.5 flex-wrap"
              key={`one-page-group-${group.name}`}
              style={{ flex: "0 0 21vw" }}
            >
              <div className="flex items-center gap-1.5">
                {group.icon && <OnePageLegendIcon icon={group.icon} />}
                <div className="text-base font-bold">{group.title}</div>
              </div>
              <div
                className="flex flex-col gap-1.5"
                style={{ marginLeft: "12px" }}
              >
                {group.items.map((item, i) => {
                  return (
                    <div
                      className="text-xs"
                      key={`one-page-group-item-${i}-${
                        item.name || group.name
                      }`}
                    >
                      {/* Test string */}
                      {/*(750m) Lorem ipsum dolor sit amet, consect*/}
                      {`(${distanceToHumanReadable(
                        item.distanceInMeters
                      )}) ${truncateText(
                        item.name || group.title,
                        poiNameMaxLength
                      )}`}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnePagePoiList;
