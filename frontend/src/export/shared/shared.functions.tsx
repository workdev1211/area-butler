import { EntityGroup } from "../../shared/search-result.types";
import { ILegendItem } from "../Legend";
import { IApiUserPoiIcon } from "../../../../shared/types/types";
import { OsmEntityMapper } from "../../../../shared/types/osm-entity-mapper";
import { deriveIconForPoiGroup } from "../../shared/shared.functions";
import { getOsmEntityByName } from "../../shared/pois.functions";

export const getFilteredLegend = (
  entityGroups: EntityGroup[],
  poiIcons?: IApiUserPoiIcon[]
): ILegendItem[] => {
  const osmEntityMapper = new OsmEntityMapper();

  // TODO translation required
  return (
    entityGroups
      .reduce<ILegendItem[]>((result, { active, name }) => {
        const foundOsmEntity = active
          ? getOsmEntityByName(osmEntityMapper.revGet(name)[0])
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
