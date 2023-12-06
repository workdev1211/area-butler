import { FunctionComponent } from "react";

import OnePageLegendIcon from "../../OnePageLegendIcon";
import { distanceToHumanReadable } from "../../../../shared/shared.functions";
import { truncateText } from "../../../../../../shared/functions/shared.functions";
import { poiNameMaxLength } from "../../../../shared/shared.constants";
import { ISortableEntityGroup } from "../../OnePageExportModal";

interface IOnePagePngPoiListProps {
  entityGroups: ISortableEntityGroup[];
}

const OnePagePngPoiList: FunctionComponent<IOnePagePngPoiListProps> = ({
  entityGroups,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          fontSize: "1.5rem",
          lineHeight: "2rem",
          fontWeight: 700,
        }}
      >
        Überblick
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
        {entityGroups.map((group) => (
          <div
            key={`one-page-group-${group.title}`}
            style={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              flex: "0 0 21vw",
              gap: "0.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {group.icon && <OnePageLegendIcon icon={group.icon} />}
              <div
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {group.title}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "12px",
                gap: "0.25rem",
              }}
            >
              {group.items.map((item, i) => (
                <div
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                  }}
                  key={`one-page-group-item-${i}-${item.name || group.title}`}
                >
                  {`(${distanceToHumanReadable(
                    item.distanceInMeters
                  )}) ${truncateText(
                    item.name || group.title,
                    poiNameMaxLength
                  )}`}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnePagePngPoiList;
