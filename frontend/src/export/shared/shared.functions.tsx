import { EntityGroup } from "../../components/SearchResultContainer";
import { ILegendItem } from "../Legend";
import { deriveIconForOsmName } from "../../shared/shared.functions";
import { IApiUserPoiIcon } from "../../../../shared/types/types";
import { getCombinedOsmEntityTypes } from "../../../../shared/functions/shared.functions";

export const getFilteredLegend = (
  entityGroups: EntityGroup[],
  poiIcons?: IApiUserPoiIcon[]
): ILegendItem[] => {
  return (
    entityGroups
      .reduce<ILegendItem[]>((result, { title, active }) => {
        const foundOsmEntityType =
          active &&
          getCombinedOsmEntityTypes().find(({ label }) => title === label);

        if (foundOsmEntityType) {
          result.push({
            title,
            icon: deriveIconForOsmName(foundOsmEntityType.name, poiIcons),
          });
        }

        return result;
      }, [])
      // TODO remove sort after ExportModal refactoring
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      )
  );
};
