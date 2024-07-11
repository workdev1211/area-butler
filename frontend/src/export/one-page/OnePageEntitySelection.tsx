import { FunctionComponent } from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { ReactSortable } from "react-sortablejs";

import { setBackgroundColor, toastError } from "../../shared/shared.functions";
import { ENTITY_GROUP_LIMIT, ISortableEntityGroup } from "./OnePageExportModal";

interface IOnePageEntitySelectionProps {
  entityGroups: ISortableEntityGroup[];
  setEntityGroups: (groups: ISortableEntityGroup[]) => void;
  closeCollapsable: () => void;
  color: string;
  entityGroupLimit?: number;
  itemNumberLimit?: number;
}

const OnePageEntitySelection: FunctionComponent<
  IOnePageEntitySelectionProps
> = ({ entityGroups, setEntityGroups, closeCollapsable, color }) => {
  const { t } = useTranslation();
  const onGroupSelectionChange = (group: ISortableEntityGroup): void => {
    const activeGroupNumber = entityGroups.reduce(
      (result, group) => (group.active ? result + 1 : result),
      0
    );

    if (
      (activeGroupNumber > ENTITY_GROUP_LIMIT ||
        activeGroupNumber === ENTITY_GROUP_LIMIT) &&
      !group.active
    ) {
      toastError(t(IntlKeys.snapshotEditor.exportTab.tooManyGroups));
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
        2. {t(IntlKeys.snapshotEditor.exportTab.POITable)} ({entityGroups.filter((group) => group.active).length}/
        {ENTITY_GROUP_LIMIT || entityGroups.length})
      </div>
      <div className="collapse-content">
        <ReactSortable list={entityGroups} setList={setEntityGroups}>
          {entityGroups.map((group) => (
            <div
              className="flex items-center gap-6 p-4 font-medium border cursor-pointer"
              key={group.id}
              onClick={() => {
                onGroupSelectionChange(group);
              }}
            >
              <input
                className="checkbox checkbox-primary"
                type="checkbox"
                // defaultChecked doesn't work as expected
                checked={group.active}
                onChange={() => {}}
              />
              <div className="select-none">
                {/* TODO move translation to the poi hook */}
                {t((IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>)[group.name])} ({group.items.length})
              </div>
            </div>
          ))}
        </ReactSortable>
      </div>
    </>
  );
};

export default OnePageEntitySelection;
