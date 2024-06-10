// TODO REMOVE IN THE FUTURE

import { FunctionComponent } from "react";

import {
  EntityGroup,
  ResultEntity,
} from "../../shared/search-result.types";
import {
  MapDisplayModesEnum,
  MeansOfTransportation,
} from "../../../../shared/types/types";
import {
  EntityRoute,
  EntityTransitRoute,
} from "../../../../shared/types/routing";
import { MapClipping } from "../../context/SearchContext";
import Localities from "./components/Localities";
import MapSettings from "./components/integration-items/MapSettings";
import MapScreenshots from "./components/integration-items/MapScreenshots";
import InteractiveMap from "./components/integration-items/InteractiveMap";
import MapExport from "./components/integration-items/MapExport";

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
        // the correct option
        // mapDisplayMode={MapDisplayModesEnum.INTEGRATION}
        mapDisplayMode={MapDisplayModesEnum.EMBEDDED}
        backgroundColor={''}
      />

      <MapSettings />

      <MapScreenshots
        mapClippings={mapClippings}
        searchAddress={searchAddress}
      />

      <InteractiveMap searchAddress={searchAddress} />

      <MapExport groupedEntries={groupedEntries} />
    </div>
  );
};

export default IntegrationMapTab;
