import { ApiOsmEntity, OsmName, TPoiGroupName } from "./types";
import { osmEntityTypes } from "../constants/osm-entity-types";

type TGroupNameMapping = Map<TPoiGroupName, Set<ApiOsmEntity>>;
type TOsmNameMapping = Map<OsmName, ApiOsmEntity>;

// TODO should be memoized in the poi hook
export class OsmEntityMapper {
  private readonly groupNameMapping: TGroupNameMapping = new Map();
  private readonly osmNameMapping: TOsmNameMapping = new Map();

  constructor() {
    osmEntityTypes.forEach((osmEntity) => {
      this.osmNameMapping.set(osmEntity.name, osmEntity);
      const existGroupMapping = this.groupNameMapping.get(osmEntity.groupName);

      if (existGroupMapping) {
        existGroupMapping.add(osmEntity);
      } else {
        this.groupNameMapping.set(osmEntity.groupName, new Set([osmEntity]));
      }
    });
  }

  getByGroupName(groupName: TPoiGroupName): ApiOsmEntity[] {
    const osmEntities = this.groupNameMapping.get(groupName);
    return osmEntities?.size ? Array.from(osmEntities) : [];
  }

  getByOsmName(osmName: OsmName): ApiOsmEntity | undefined {
    return this.osmNameMapping.get(osmName);
  }

  getGroupNameMapping(): TGroupNameMapping {
    return this.groupNameMapping;
  }

  getOsmNameMapping(): TOsmNameMapping {
    return this.osmNameMapping;
  }
}
