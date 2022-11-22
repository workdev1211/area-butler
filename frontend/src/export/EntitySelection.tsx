import { FunctionComponent, useEffect, useState } from "react";

import { EntityGroup, ResultEntity } from "../components/SearchResultContainer";

interface IEntitySelectionProps {
  groupedEntries: EntityGroup[];
  setGroupedEntries: (groups: EntityGroup[]) => void;
  limit?: number;
}

const EntitySelection: FunctionComponent<IEntitySelectionProps> = ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const onGroupSelectionChange = (group: EntityGroup): void => {
    group.active = !group.active;
    setGroupedEntries([...groupedEntries]);
  };

  const onLocationSelectionChange = (entity: ResultEntity): void => {
    entity.selected = !entity.selected;
    setGroupedEntries([...groupedEntries]);
  };

  const [localityOpen, setLocalityOpen] = useState<string[]>([]);

  const toggleLocality = (title: string, open: boolean): void => {
    const filtered = [...localityOpen.filter((l) => l !== title)];

    if (open) {
      filtered.push(title);
    }

    setLocalityOpen(filtered);
  };

  return (
    <div>
      <h1 className="my-5 font-bold">
        Ausgewählte Lokalitäten (
        {groupedEntries.filter((group) => group.active).length} /{" "}
        {groupedEntries.length})
      </h1>

      {groupedEntries.map((group) => (
        <div
          className={
            "collapse border collapse-arrow" +
            (localityOpen.includes(group.title)
              ? " collapse-open"
              : " collapse-closed")
          }
          key={`collapsable-${group.title}`}
        >
          <div
            className="collapse-title font-medium flex items-center gap-6"
            onClick={() => {
              toggleLocality(group.title, !localityOpen.includes(group.title));
            }}
            key={`collapsable-title-${group.title}`}
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
            <span>
              {group.title} ({group.items.length})
            </span>
          </div>

          <div className="collapse-content bg-white">
            {group.items
              .slice(0, limit)
              .map((item: ResultEntity, index: number) => (
                <div
                  className="flex gap-5 my-3 overflow-y-scroll items-center"
                  key={`${group.title}-${item.label}-${item.name}-${index}`}
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
                    {item.name ?? item.label} (
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
