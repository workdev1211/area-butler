import { EntityGroup } from "../../shared/search-result.types";
import { ILegendItem } from "../Legend";
import { IApiUserPoiIcon } from "../../../../shared/types/types";
import { deriveIconForPoiGroup } from "../../shared/shared.functions";

export const getFilteredLegend = (
  entityGroups: EntityGroup[],
  poiIcons?: IApiUserPoiIcon[]
): ILegendItem[] => {
  return entityGroups.reduce<ILegendItem[]>(
    (result, { active, name, title }) => {
      if (active) {
        result.push({
          title,
          name,
          icon: deriveIconForPoiGroup(name, poiIcons),
        });
      }

      return result;
    },
    []
  );
};
