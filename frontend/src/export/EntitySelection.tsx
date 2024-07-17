import { FC, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { EntityGroup, ResultEntity } from "../shared/search-result.types";
import { TPoiGroupName } from "../../../shared/types/types";

interface IEntitySelectionProps {
  filteredEntities: EntityGroup[];
  setFilteredEntities: (groups: EntityGroup[]) => void;
  limit?: number;
}

const EntitySelection: FC<IEntitySelectionProps> = ({
  filteredEntities,
  setFilteredEntities,
  limit = 10,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    filteredEntities.forEach(({ items }) =>
      items.forEach((item: ResultEntity, i: number) => {
        if (i < limit) {
          item.selected = true;
        }
      })
    );

    setFilteredEntities([...filteredEntities]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const onGroupSelectionChange = (group: EntityGroup): void => {
    group.active = !group.active;
    setFilteredEntities([...filteredEntities]);
  };

  const onLocationSelectionChange = (entity: ResultEntity): void => {
    entity.selected = !entity.selected;
    setFilteredEntities([...filteredEntities]);
  };

  const [localityOpen, setLocalityOpen] = useState<TPoiGroupName[]>([]);

  const toggleLocality = (groupName: TPoiGroupName, open: boolean): void => {
    const filtered = [...localityOpen.filter((l) => l !== groupName)];

    if (open) {
      filtered.push(groupName);
    }

    setLocalityOpen(filtered);
  };

  return (
    <div>
      <h1 className="my-5 font-bold">
        {t(IntlKeys.snapshotEditor.exportTab.selectedLocalities)} (
        {filteredEntities.filter((group) => group.active).length} /{" "}
        {filteredEntities.length})
      </h1>

      {filteredEntities.map((group) => (
        <div
          className={
            "collapse border collapse-arrow" +
            (localityOpen.includes(group.name)
              ? " collapse-open"
              : " collapse-closed")
          }
          key={`collapsable-${group.name}`}
        >
          <div
            className="collapse-title font-medium flex items-center gap-6"
            onClick={() => {
              toggleLocality(group.name, !localityOpen.includes(group.name));
            }}
            key={`collapsable-title-${group.name}`}
          >
            <input
              className="checkbox checkbox-primary"
              type="checkbox"
              checked={{ ...group }.active}
              onChange={() => {
                onGroupSelectionChange(group);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            <span>{`${group.title} (${group.items.length})`}</span>
          </div>

          <div className="collapse-content bg-white">
            {group.items
              .slice(0, limit)
              .map((item: ResultEntity, index: number) => (
                <div
                  className="flex gap-5 my-3 overflow-y-scroll items-center"
                  key={`${group.name}-${item.name}-${index}`}
                >
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => {
                      onLocationSelectionChange(item);
                    }}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text text-sm">
                    {item.name || group.title} (
                    {Math.round(item.distanceInMeters)} m)
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntitySelection;
