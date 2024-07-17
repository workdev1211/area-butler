import { EntityGroup } from "../../shared/search-result.types";
import { ILegendItem } from "../Legend";
import { IApiUserPoiIcon } from "../../../../shared/types/types";
import { deriveIconForPoiGroup } from "../../shared/shared.functions";

export const getFilteredLegend = (
  entityGroups: EntityGroup[],
  poiIcons?: IApiUserPoiIcon[]
): ILegendItem[] => {
  return (
    entityGroups
      .reduce<ILegendItem[]>((result, { active, name, title }) => {
        if (active) {
          result.push({
            title,
            icon: deriveIconForPoiGroup(name, poiIcons),
          });
        }

        return result;
      }, [])
      // TODO remove sort after ExportModal refactoring
      .sort((a, b) => a.title.localeCompare(b.title))
  );
};
