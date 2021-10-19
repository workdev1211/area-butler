import { EntityGroup } from "pages/SearchResultPage";
import { FunctionComponent } from "react";

export interface EntityListProps {
  entityGroup: EntityGroup;
  limit?: number;
}

export const EntityList: FunctionComponent<EntityListProps> = ({
  entityGroup,
  limit = 3,
}) => {
  const items = [...entityGroup.items].slice(0, limit);
  return (
    <>
      <h1 className="text-xl ml-2 font-bold">{entityGroup.title}</h1>
      <ol className="list-decimal">
        {items.map((item) => (
          <li className="ml-5 my-2">
            <div className="bg-primary rounded p-2 text-white font-bold flex gap-2">
                {`${item.name ? item.name : entityGroup.title} (${Math.round(item.distanceInMeters)} Meter)`}
            </div>
          </li>
        ))}
      </ol>
    </>
  );
};
