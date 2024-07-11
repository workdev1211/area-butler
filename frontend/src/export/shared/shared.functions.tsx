import { EntityGroup } from "../../shared/search-result.types";
import { ILegendItem } from "../Legend";
import { IApiUserPoiIcon } from "../../../../shared/types/types";
import { OsmNameAndPoiGroupMapper } from "../../../../shared/constants/osm-name-and-poi-group-mapper";
import { deriveIconForPoiGroup } from "../../shared/shared.functions";
import { getOsmEntityByName } from "../../shared/pois.functions";

export const getFilteredLegend = (
  entityGroups: EntityGroup[],
  poiIcons?: IApiUserPoiIcon[]
): ILegendItem[] => {
  const osmNameAndPoiGroupMapper = new OsmNameAndPoiGroupMapper();

  // TODO translation required
  return (
    entityGroups
      .reduce<ILegendItem[]>((result, { active, name }) => {
        const foundOsmEntity = active
          ? getOsmEntityByName(osmNameAndPoiGroupMapper.revGet(name)[0])
          : undefined;

        if (foundOsmEntity) {
          result.push({
            title: foundOsmEntity.label,
            icon: deriveIconForPoiGroup(name, poiIcons),
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
