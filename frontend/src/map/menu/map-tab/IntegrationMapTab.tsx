import { FunctionComponent } from "react";

import {
  EntityGroup,
  ResultEntity,
} from "../../../components/SearchResultContainer";
import {
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../../shared/types/types";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../../shared/types/routing";
import { MapClipping } from "../../../context/SearchContext";
import Localities from "./components/items/Localities";
import MapSettings from "./components/integration-items/MapSettings";
import MapScreenshots from "./components/integration-items/MapScreenshots";

interface IIntegrationMapTabProps {
  groupedEntries: EntityGroup[];
  toggleAllLocalities: () => void;
  toggleRoute: (item: ResultEntity, mean: MeansOfTransportation) => void;
  routes: EntityRoute[];
  toggleTransitRoute: (item: ResultEntity) => void;
  transitRoutes: EntityTransitRoute[];
  mapClippings: MapClipping[];
  searchAddress: string;
}

const IntegrationMapTab: FunctionComponent<IIntegrationMapTabProps> = ({
  groupedEntries,
  toggleAllLocalities,
  toggleRoute,
  routes,
  toggleTransitRoute,
  transitRoutes,
  mapClippings,
  searchAddress,
}) => {
  return (
    <div className="map-tab z-9000">
      <Localities
        groupedEntries={groupedEntries}
        toggleAllLocalities={toggleAllLocalities}
        toggleRoute={toggleRoute}
        routes={routes}
        toggleTransitRoute={toggleTransitRoute}
        transitRoutes={transitRoutes}
        mapDisplayMode={MapDisplayModesEnum.INTEGRATION}
      />

      <MapSettings />

      <MapScreenshots
        mapClippings={mapClippings}
        searchAddress={searchAddress}
      />
    </div>
  );
};

export default IntegrationMapTab;
