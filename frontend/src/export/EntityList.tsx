import React from "react";
import {
  deriveColorPalette,
  distanceToHumanReadable
} from "shared/shared.functions";
import "./EntityList.scss";
import { EntityGroup } from "../shared/search-result.types";

export interface EntityListProps {
  entityGroup: EntityGroup;
  limit?: number;
  primaryColor?: string;
}

export const EntityList: React.FunctionComponent<EntityListProps> = ({
  entityGroup,
  limit = 3,
  primaryColor = "#aa0c54"
}) => {
  const colorPalette = deriveColorPalette(primaryColor);

  const entityListItemStyle = {
    background: `linear-gradient(to right, ${colorPalette.primaryColorDark}, ${colorPalette.primaryColor} 20%)`,
    color: colorPalette.textColor
  };

  const items = [...entityGroup.items]
    .filter(item => item.selected)
    .slice(0, limit);
  return (
    <>
      <h1 className="text-base ml-2 font-bold">{entityGroup.title}</h1>
      <ol>
        {items.map((item, index: number) => (
          <li className="my-2" key={item.id}>
            <div className="entity-list-item" style={entityListItemStyle}>
              {`${index + 1}. ${
                item.name ? item.name : entityGroup.title
              } (${distanceToHumanReadable(item.distanceInMeters)})`}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
};
