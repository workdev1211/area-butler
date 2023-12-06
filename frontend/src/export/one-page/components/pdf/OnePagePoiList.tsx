import { FunctionComponent } from "react";

import OnePageLegendIcon from "../../OnePageLegendIcon";
import { distanceToHumanReadable } from "../../../../shared/shared.functions";
import { truncateText } from "../../../../../../shared/functions/shared.functions";
import { poiNameMaxLength } from "../../../../shared/shared.constants";
import { ISortableEntityGroup } from "../../OnePageExportModal";

interface IOnePagePoiListProps {
  filteredGroups: ISortableEntityGroup[];
}

const OnePagePoiList: FunctionComponent<IOnePagePoiListProps> = ({
  filteredGroups,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-2xl font-bold">Überblick</div>
      <div className="flex gap-3 flex-wrap">
        {filteredGroups.map((group) => {
          return (
            <div
              className="flex flex-col gap-1 flex-wrap"
              key={`one-page-group-${group.title}`}
              style={{ flex: "0 0 21vw" }}
            >
              <div className="flex items-center gap-1.5">
                {group.icon && <OnePageLegendIcon icon={group.icon} />}
                <div className="text-base font-bold">{group.title}</div>
              </div>
              <div
                className="flex flex-col gap-1"
                style={{ marginLeft: "12px" }}
              >
                {group.items.map((item, i) => {
                  return (
                    <div
                      className="text-xs"
                      key={`one-page-group-item-${i}-${
                        item.name || group.title
                      }`}
                    >
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
