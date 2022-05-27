import { FunctionComponent } from "react";

import "./PreferredLocationsModal.scss";
import {
  EntityGroup,
  ResultEntity,
} from "../../../components/SearchResultContainer";
import { MeansOfTransportation } from "../../../../../shared/types/types";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import CloseCross from "../../../assets/icons/cross.svg";
import CategoryContent from "../menu-item/CategoryContent";

export interface PreferredLocationsModalProps {
  entityGroup: EntityGroup;
  routes: EntityRoute[];
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  transitRoutes: EntityTransitRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  closeModal: (isShown: boolean) => void;
}

const PreferredLocationsModal: FunctionComponent<
  PreferredLocationsModalProps
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
        <span>Wichtige Adressen</span>
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
