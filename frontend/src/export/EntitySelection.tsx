import { EntityGroup, ResultEntity } from "pages/SearchResultPage";
import { FunctionComponent, useEffect, useState } from "react";

export interface EntitySelectionProps {
  groupedEntries: EntityGroup[];
  setGroupedEntries: (groups: EntityGroup[]) => void;
  limit?: number;
}

const EntitySelection: FunctionComponent<EntitySelectionProps> = ({
  groupedEntries,
  setGroupedEntries,
  limit = 10,
}) => {
  useEffect(() => {
    groupedEntries.forEach((group) =>
      group.items.forEach((item: ResultEntity, i: number) => {
        if (i < limit) {
          item.selected = true;
        }
      })
    );
    setGroupedEntries([...groupedEntries]);
  }, [limit, setGroupedEntries]);

  const onGroupSelectionChange = (group: EntityGroup) => {
    group.active = !group.active;
    setGroupedEntries([...groupedEntries]);
  };

  const onLocationSelectionChange = (entity: ResultEntity) => {
    entity.selected = !entity.selected;
    setGroupedEntries([...groupedEntries]);
  };

  const [localityOpen, setLocalityOpen] = useState<string[]>([]);

  const toggleLocality = (title: string, open: boolean) => {
    const filtered = [...localityOpen.filter((l) => l !== title)];
    if (open) {
      filtered.push(title);
    }
    setLocalityOpen(filtered);
  };

  return (
    <div className="overflow-y-scroll h-96">
      <h1 className="my-5 font-bold">
        Ausgewählte Lokalitäten (
        {groupedEntries.filter((group) => group.active).length}/
        {groupedEntries.length})
      </h1>

      {groupedEntries.map((group) => (
        <div
          className={
            "collapse w-96 border collapse-arrow" +
            (localityOpen.includes(group.title)
              ? " collapse-open"
              : " collapse-closed")
          }
        >
          <div
            className="collapse-title font-medium flex items-center gap-6"
            onClick={() =>
              toggleLocality(group.title, !localityOpen.includes(group.title))
            }
          >
            <input
              type="checkbox"
              checked={{...group}.active}
              onChange={(e) => {
                onGroupSelectionChange(group);
              }}
              onClick={(e) => e.stopPropagation()}
              className="checkbox checkbox-primary"
            />
            <span>
            {group.title} ({group.items.length})
            </span>
          </div>
          <div className="collapse-content bg-white">
            {group.items.slice(0, limit).map((item: ResultEntity) => (
              <div className="flex gap-5 my-3 overflow-y-scroll items-center">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => onLocationSelectionChange(item)}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text text-sm">
                  {item.name ?? item.label} ({Math.round(item.distanceInMeters)}{" "}
                  m)
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
