import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

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
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      }}
    >
      <div
        style={{
          fontSize: "1.5rem",
          lineHeight: "2rem",
          fontWeight: 700,
        }}
      >
        {t(IntlKeys.snapshotEditor.dataTab.overview)}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {entityGroups.map((group) => (
          <div
            key={`one-page-group-${group.name}`}
            style={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              flex: "0 0 21vw",
              gap: "0.375rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
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
                gap: "0.375rem",
              }}
            >
              {group.items.map((item, i) => (
                <div
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                  }}
                  key={`one-page-group-item-${i}-${item.name || group.name}`}
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnePagePngPoiList;
