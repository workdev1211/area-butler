import { FunctionComponent } from "react";

import "./PreferredLocationsModal.scss";

import {
  EntityGroup,
  ResultEntity,
} from "../../../shared/search-result.types";
import { MeansOfTransportation } from "../../../../../shared/types/types";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import CloseCross from "../../../assets/icons/cross.svg";
import CategoryContent from "../components/menu-item/CategoryContent";
import { preferredLocationsTitle } from "../../../shared/shared.functions";

interface IPreferredLocationsModalProps {
  entityGroup: EntityGroup;
  routes: EntityRoute[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  transitRoutes: EntityTransitRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  closeModal: (isShown: boolean) => void;
}

const PreferredLocationsModal: FunctionComponent<
  IPreferredLocationsModalProps
> = ({
  entityGroup,
  routes,
  toggleRoute,
  transitRoutes,
  toggleTransitRoute,
  closeModal,
}) => {
  return (
    <div className="preferred-locations">
      <div className="collapse-title">
        <span>{preferredLocationsTitle}</span>
        <img src={CloseCross} alt="close" onClick={() => closeModal(false)} />
      </div>
      <CategoryContent
        entityGroup={entityGroup}
        routes={routes}
        toggleRoute={toggleRoute}
        transitRoutes={transitRoutes}
        toggleTransitRoute={toggleTransitRoute}
        isListOpen={true}
      />
    </div>
  );
};

export default PreferredLocationsModal;
