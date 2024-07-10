import { EntityGroup } from "../../shared/search-result.types";
import { ILegendItem } from "../Legend";
import { deriveIconForOsmName } from "../../shared/shared.functions";
import { IApiUserPoiIcon } from "../../../../shared/types/types";
import { getOsmCategoryByName } from "../../shared/pois.functions";

export const getFilteredLegend = (
  entityGroups: EntityGroup[],
  poiIcons?: IApiUserPoiIcon[]
): ILegendItem[] => {
  return (
    entityGroups
      .reduce<ILegendItem[]>((result, { title, active }) => {
        const foundOsmCategory = active
          ? getOsmCategoryByName(title)
          : undefined;

        if (foundOsmCategory) {
          result.push({
            title,
            icon: deriveIconForOsmName(title, poiIcons),
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
