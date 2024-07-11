import { FC } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  deriveColorPalette,
  distanceToHumanReadable,
} from "shared/shared.functions";
import "./EntityList.scss";
import { EntityGroup } from "../shared/search-result.types";

export interface IEntityListProps {
  entityGroup: EntityGroup;
  limit?: number;
  primaryColor?: string;
}

export const EntityList: FC<IEntityListProps> = ({
  entityGroup,
  limit = 3,
  primaryColor = "#aa0c54",
}) => {
  const { t } = useTranslation();

  const colorPalette = deriveColorPalette(primaryColor);

  const entityListItemStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor,
  };

  // TODO refactor to 'reduce'
  const items = [...entityGroup.items]
    .filter((item) => item.selected)
    .slice(0, limit);

  return (
    <>
      <h1 className="text-base ml-2 font-bold">
        {/* TODO move translation to the poi hook */}
        {t(
          (IntlKeys.snapshotEditor.pointsOfInterest as Record<string, string>)[
            entityGroup.name
          ]
        )}
      </h1>
      <ol>
        {items.map((item, index: number) => (
          <li className="my-2" key={item.id}>
            <div className="entity-list-item" style={entityListItemStyle}>
              {/* TODO move translation to the poi hook */}
              {`${index + 1}. ${
                item.name
                  ? item.name
                  : t(
                      (
                        IntlKeys.snapshotEditor.pointsOfInterest as Record<
                          string,
                          string
                        >
                      )[entityGroup.name]
                    )
              } (${distanceToHumanReadable(item.distanceInMeters)})`}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
};
