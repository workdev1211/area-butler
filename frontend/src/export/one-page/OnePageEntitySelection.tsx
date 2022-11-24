import { FunctionComponent, useEffect } from "react";

import { EntityGroup } from "../../components/SearchResultContainer";
import { toastError } from "../../shared/shared.functions";

interface IOnePageEntitySelectionProps {
  groupedEntries: EntityGroup[];
  setGroupedEntries: (groups: EntityGroup[]) => void;
  entityGroupLimit?: number;
  itemNumberLimit?: number;
}

const OnePageEntitySelection: FunctionComponent<
  IOnePageEntitySelectionProps
> = ({
  groupedEntries,
  setGroupedEntries,
  entityGroupLimit = 8,
  itemNumberLimit = 3,
}) => {
  useEffect(() => {
    const processedEntityGroups = [...groupedEntries]
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      )
      .map((group, i) => {
        group.active = i < entityGroupLimit;

        group.items = group.items.map((item, i) => {
          item.distanceInMeters = Math.round(item.distanceInMeters);
          item.selected = i < itemNumberLimit;

          return item;
        });

        group.items.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

        return group;
      });

    setGroupedEntries([...processedEntityGroups]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onGroupSelectionChange = (group: EntityGroup): void => {
    const activeGroupNumber = groupedEntries.reduce(
      (result, group) => (group.active ? result + 1 : result),
      0
    );

    if (
      (activeGroupNumber > entityGroupLimit ||
        activeGroupNumber === entityGroupLimit) &&
      !group.active
    ) {
      toastError("Es wurden zu viele Gruppen ausgewählt!");
      return;
    }

    group.active = !group.active;
    setGroupedEntries([...groupedEntries]);
  };

  return (
    <div>
      <h1 className="my-5 font-bold">
        Überblick: Kategorien wählen (
        {groupedEntries.filter((group) => group.active).length} /{" "}
        {entityGroupLimit
          ? `${entityGroupLimit} (${groupedEntries.length})`
          : groupedEntries.length}
        )
      </h1>
      <div className="flex flex-col gap-3">
        {groupedEntries.map((group, i) => (
          <div
            className="flex items-center gap-6 font-medium p-4 border"
            key={`entity-group-${group.title}`}
          >
            <input
              className="checkbox checkbox-primary"
              type="checkbox"
              checked={group.active}
              onChange={() => {
                onGroupSelectionChange(group);
              }}
            />
            <div className="w-full select-none cursor-pointer">
              {group.title} ({group.items.length})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnePageEntitySelection;
