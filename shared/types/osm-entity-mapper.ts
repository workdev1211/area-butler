import {
  ApiOsmEntity,
  ApiOsmEntityCategory,
  OsmName,
  TPoiGroupName,
} from "./types";
import { osmEntityTypes } from "../constants/osm-entity-types";

type TCategoryMapping = Map<ApiOsmEntityCategory, Set<ApiOsmEntity>>;
type TGroupNameMapping = Map<TPoiGroupName, Set<ApiOsmEntity>>;
type TOsmNameMapping = Map<OsmName, ApiOsmEntity>;

// TODO should be memoized in the poi hook
export class OsmEntityMapper {
  private readonly categoryMapping: TCategoryMapping = new Map();
  private readonly groupNameMapping: TGroupNameMapping = new Map();
  private readonly osmNameMapping: TOsmNameMapping = new Map();

  constructor() {
    osmEntityTypes.forEach((osmEntity) => {
      this.osmNameMapping.set(osmEntity.name, osmEntity);
      const existCategoryMapping = this.categoryMapping.get(osmEntity.category);
      const existGroupMapping = this.groupNameMapping.get(osmEntity.groupName);

      if (existCategoryMapping) {
        existCategoryMapping.add(osmEntity);
      } else {
        this.categoryMapping.set(osmEntity.category, new Set([osmEntity]));
      }

      if (existGroupMapping) {
        existGroupMapping.add(osmEntity);
      } else {
        this.groupNameMapping.set(osmEntity.groupName, new Set([osmEntity]));
      }
    });
  }

  getByCategory(category: ApiOsmEntityCategory): ApiOsmEntity[] {
    const osmEntities = this.categoryMapping.get(category);
    return osmEntities?.size ? Array.from(osmEntities) : [];
  }

  getByGroupName(groupName: TPoiGroupName): ApiOsmEntity[] {
    const osmEntities = this.groupNameMapping.get(groupName);
    return osmEntities?.size ? Array.from(osmEntities) : [];
  }

  getByOsmName(osmName: OsmName): ApiOsmEntity | undefined {
    return this.osmNameMapping.get(osmName);
  }

  getGrpNameByOsmName(osmName: OsmName): TPoiGroupName | undefined {
    if ([OsmName.favorite, OsmName.property].includes(osmName)) {
      return osmName as TPoiGroupName;
    }

    return this.osmNameMapping.get(osmName)?.groupName;
  }

  getCategoryMapping(): TGroupNameMapping {
    return this.groupNameMapping;
  }

  getGroupNameMapping(): TGroupNameMapping {
    return this.groupNameMapping;
  }

  getOsmNameMapping(): TOsmNameMapping {
    return this.osmNameMapping;
  }
}
