import { FunctionComponent, useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";

import { EntityGroup } from "../../components/SearchResultContainer";
import {
  preferredLocationsTitle,
  setBackgroundColor,
  toastError,
} from "../../shared/shared.functions";

interface ISortableEntityGroup extends EntityGroup {
  id: string;
}

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
  const [entityGroups, setEntityGroups] = useState<ISortableEntityGroup[]>([]);
  const [importantAddressGroup, setImportantAddressGroup] =
    useState<EntityGroup>();

  useEffect(() => {
    const processedEntityGroups: ISortableEntityGroup[] = [...groupedEntries]
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      )
      .reduce<ISortableEntityGroup[]>((result, group, i) => {
        if (group.title === preferredLocationsTitle) {
          setImportantAddressGroup(group);
          return result;
        }

        const processedEntityGroup = {
          ...group,
          active: i < entityGroupLimit,
          id: group.title,
        };

        processedEntityGroup.items = processedEntityGroup.items.map(
          (item, i) => {
            item.distanceInMeters = Math.round(item.distanceInMeters);
            item.selected = i < itemNumberLimit;

            return item;
          }
        );

        processedEntityGroup.items.sort(
          (a, b) => a.distanceInMeters - b.distanceInMeters
        );

        result.push(processedEntityGroup);

        return result;
      }, []);

    setEntityGroups([...processedEntityGroups]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const resultingGroupedEntries = entityGroups.map((group) => {
      const processedEntityGroup: EntityGroup & { id?: string } = { ...group };
      delete processedEntityGroup.id;

      return processedEntityGroup;
    });

    if (importantAddressGroup) {
      resultingGroupedEntries.push(importantAddressGroup);
    }

    setGroupedEntries(resultingGroupedEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityGroups]);

  const onGroupSelectionChange = (group: ISortableEntityGroup): void => {
    const activeGroupNumber = entityGroups.reduce(
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
    setEntityGroups([...entityGroups]);
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
        2. POI-Tabelle ({entityGroups.filter((group) => group.active).length}/
        {entityGroupLimit || entityGroups.length})
      </div>
      <div className="collapse-content">
        <ReactSortable list={entityGroups} setList={setEntityGroups}>
          {entityGroups.map((group) => (
            <div
              className="flex items-center gap-6 p-4 font-medium border cursor-pointer"
              key={`entity-group-${group.title}`}
            >
              <input
                className="checkbox checkbox-primary"
                type="checkbox"
                // defaultChecked doesn't work as expected
                checked={group.active}
                onChange={() => {}}
                onClick={() => {
                  onGroupSelectionChange(group);
                }}
              />
              <div className="select-none">
                {group.title} ({group.items.length})
              </div>
            </div>
          ))}
        </ReactSortable>
      </div>
    </>
  );
};

export default OnePageEntitySelection;
