import { EntityGroup } from "../../components/SearchResultContainer";
import { ILegendItem } from "../Legend";
import { osmEntityTypes } from "../../../../shared/constants/constants";
import { deriveIconForOsmName } from "../../shared/shared.functions";
import { IApiUserPoiIcon } from "../../../../shared/types/types";

export const getFilteredLegend = (
  groupedEntities: EntityGroup[],
  poiIcons?: IApiUserPoiIcon[]
): ILegendItem[] => {
  return groupedEntities
    .reduce<ILegendItem[]>((result, { title, active }) => {
      const foundOsmEntityType =
        active && osmEntityTypes.find(({ label }) => title === label);

      if (foundOsmEntityType) {
        result.push({
          title,
          icon: deriveIconForOsmName(foundOsmEntityType.name, poiIcons),
        });
      }

      return result;
    }, [])
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
};
