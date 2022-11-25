import { FunctionComponent, useEffect } from "react";

import { EntityGroup } from "../../components/SearchResultContainer";
import { setBackgroundColor, toastError } from "../../shared/shared.functions";

interface IOnePageEntitySelectionProps {
  groupedEntries: EntityGroup[];
  setGroupedEntries: (groups: EntityGroup[]) => void;
  closeCollapsable: () => void;
  color: string;
  entityGroupLimit?: number;
  itemNumberLimit?: number;
}

const OnePageEntitySelection: FunctionComponent<
  IOnePageEntitySelectionProps
> = ({
  groupedEntries,
  setGroupedEntries,
  closeCollapsable,
  color,
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
    <>
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, color);
        }}
        onClick={closeCollapsable}
      >
        2. Überblick ({groupedEntries.filter((group) => group.active).length}/
        {entityGroupLimit || groupedEntries.length})
      </div>
      <div className="collapse-content">
        {groupedEntries.map((group, i) => (
          <div
            className="flex items-center gap-6 p-4 font-medium border cursor-pointer"
            onClick={() => {
              onGroupSelectionChange(group);
            }}
            key={`entity-group-${group.title}`}
          >
            <input
              className="checkbox checkbox-primary"
              type="checkbox"
              checked={group.active}
              readOnly={true}
            />
            <div className="select-none">
              {group.title} ({group.items.length})
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default OnePageEntitySelection;
