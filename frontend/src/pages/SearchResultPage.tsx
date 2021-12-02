import React, { useContext, useEffect, useState } from "react";
import DefaultLayout from "../layout/defaultLayout";
import { SearchContext, SearchContextActions } from "../context/SearchContext";
import {
  ApiAddress,
  ApiCoordinates,
  ApiSearchResponse,
  ApiUser,
  ApiUserRequests,
  MeansOfTransportation,
  OsmName
} from "../../../shared/types/types";
import Map, { defaultMapZoom } from "../map/Map";
import MapNavBar from "../map/MapNavBar";
import {
  localStorageSearchContext,
  meansOfTransportations
} from "../../../shared/constants/constants";
import {
  groupBy,
} from "../../../shared/functions/shared.functions";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import { useHistory } from "react-router-dom";
import MapMenu from "../map/MapMenu";
import {
  distanceInMeters,
  entityIncludesMean,
  preferredLocationsTitle,
  realEstateListingsTitle
} from "shared/shared.functions";
import "./SearchResultPage.css";
import ExportModal from "export/ExportModal";
import pdfIcon from "../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import openMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-menu.svg";
import closeMenuIcon from "../assets/icons/icons-16-x-16-outline-ic-close.svg";
import BackButton from "../layout/BackButton";
import { RealEstateContext } from "context/RealEstateContext";
import { ApiRoute, ApiTransitRoute } from "../../../shared/types/routing";
import { useRouting } from "../hooks/routing";
import { v4 } from "uuid";
import { UserActions, UserContext } from "context/UserContext";
import TourStarter from "tour/TourStarter";
import { useHttp } from "hooks/http";

export interface ResultEntity {
  name?: string;
  type: string;
  label: string;
  id: string;
  coordinates: ApiCoordinates;
  address: ApiAddress;
  byFoot: boolean;
  byBike: boolean;
  byCar: boolean;
  distanceInMeters: number;
  selected?: boolean;
}

export interface EntityGroup {
  title: string;
  active: boolean;
  items: ResultEntity[];
}

export interface EntityRoute {
  title: string;
  coordinates: ApiCoordinates;
  show: boolean;
  routes: ApiRoute[];
}

export interface EntityTransitRoute {
  title: string;
  coordinates: ApiCoordinates;
  show: boolean;
  route: ApiTransitRoute;
}

const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

const buildEntityDataFromPreferredLocations = (
  centerCoordinates: ApiCoordinates,
  preferredLocations: ApiPreferredLocation[]
): ResultEntity[] => {
  return preferredLocations
    .filter(preferredLocation => !!preferredLocation.coordinates)
    .map(preferredLocation => ({
      id: v4(),
      name: `${preferredLocation.title} (${preferredLocation.address})`,
      label: preferredLocationsTitle,
      type: OsmName.favorite,
      distanceInMeters: distanceInMeters(
        centerCoordinates,
        preferredLocation.coordinates!
      ), // Calc distance
      coordinates: preferredLocation.coordinates!,
      address: { street: preferredLocation.address },
      byFoot: true,
      byBike: true,
      byCar: true,
      selected: false
    }));
};

const buildEntityDataFromRealEstateListings = (
  centerCoordinates: ApiCoordinates,
  realEstateListings: ApiRealEstateListing[]
): ResultEntity[] => {
  return realEstateListings
    .filter(realEstateListing => !!realEstateListing.coordinates)
    .map(realEstateListing => ({
      id: v4(),
      name: `${realEstateListing.name} (${realEstateListing.address})`,
      label: realEstateListingsTitle,
      type: OsmName.property,
      distanceInMeters: distanceInMeters(
        centerCoordinates,
        realEstateListing.coordinates!
      ), // Calc distance
      coordinates: realEstateListing.coordinates!,
      address: { street: realEstateListing.address },
      byFoot: true,
      byBike: true,
      byCar: true,
      selected: false
    }));
};

const buildEntityData = (
  locationSearchResult: ApiSearchResponse
): ResultEntity[] | null => {
  if (!locationSearchResult) {
    return null;
  }
  const allLocations = Object.values(locationSearchResult.routingProfiles)
    .map(a =>
      a.locationsOfInterest.sort(
        (a, b) => a.distanceInMeters - b.distanceInMeters
      )
    )
    .flat();
  const allLocationIds = new Set(
    allLocations.map(location => location.entity.id)
  );
  return Array.from(allLocationIds).map(locationId => {
    const location = allLocations.find(l => l.entity.id === locationId)!;
    return {
      id: locationId!,
      name: location.entity.name,
      label: location.entity.label,
      type: location.entity.type,
      distanceInMeters: location.distanceInMeters,
      coordinates: location.coordinates,
      address: location.address,
      byFoot:
        locationSearchResult!.routingProfiles.WALK?.locationsOfInterest?.some(
          l => l.entity.id === locationId
        ) ?? false,
      byBike:
        locationSearchResult!.routingProfiles.BICYCLE?.locationsOfInterest?.some(
          l => l.entity.id === locationId
        ) ?? false,
      byCar:
        locationSearchResult!.routingProfiles.CAR?.locationsOfInterest?.some(
          l => l.entity.id === locationId
        ) ?? false,
      selected: false
    };
  });
};

const SearchResultPage: React.FunctionComponent = () => {
  const { fetchRoutes, fetchTransitRoutes } = useRouting();
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );

  const { realEstateState } = useContext(RealEstateContext);
  const { userState, userDispatch } = useContext(UserContext);

  const { get } = useHttp();

  useEffect(() => {
    const fetchUserRequests = async () => {
      const latestUserRequests: ApiUserRequests = (await get<ApiUserRequests>("/api/location/latest-user-requests")).data;
      userDispatch({type: UserActions.SET_LATEST_USER_REQUESTS, payload: latestUserRequests});
    }

    fetchUserRequests();
  }, [true]);

  const user: ApiUser = userState.user;
  const hasFullyCustomizableExpose =
    user.subscriptionPlan?.config.appFeatures.fullyCustomizableExpose;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const history = useHistory();

  const routingKeys = Object.keys(
    searchContextState?.searchResponse?.routingProfiles || []
  );
  const availableMeans = meansOfTransportations
    .filter(mot => routingKeys.includes(mot.type))
    .map(mot => mot.type);
  const [activeMeans, setActiveMeans] = useState([...availableMeans]);

  const [filteredEntites, setFilteredEntities] = useState<ResultEntity[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<EntityGroup[]>([]);
  const [routes, setRoutes] = useState<EntityRoute[]>([]);
  const [transitRoutes, setTransitRoutes] = useState<EntityTransitRoute[]>([]);
  const censusDataAvailable = !!searchContextState.censusData?.length;
  const federalElectionDataAvailable = !!searchContextState.federalElectionData;
  const particlePollutionDataAvailable = !!searchContextState
    .particlePollutionData?.length;

  const searchResponseString = JSON.stringify(
    searchContextState.searchResponse
  );
  useEffect(() => {
    const searchResponseParsed = !!searchResponseString
      ? JSON.parse(searchResponseString)
      : null;

    if (!searchResponseParsed) {
      return;
    }

    const centerOfSearch = searchResponseParsed?.centerOfInterest?.coordinates;
    let entities = buildEntityData(searchResponseParsed)?.filter(entity =>
      entityIncludesMean(entity, activeMeans)
    );
    if (!!searchContextState.preferredLocations) {
      entities?.push(
        ...buildEntityDataFromPreferredLocations(
          centerOfSearch,
          searchContextState.preferredLocations
        )
      );
    }
    if (!!realEstateState.listings) {
      entities?.push(
        ...buildEntityDataFromRealEstateListings(
          centerOfSearch,
          realEstateState.listings
        )
      );
    }
    if (entities) {
      setFilteredEntities(entities);

      const newGroupedEntries: any[] = Object.entries(
        groupBy(entities, (item: ResultEntity) => item.label)
      );

      const combinedGroupEntries = [
        {
          title: preferredLocationsTitle,
          active: true,
          items: newGroupedEntries
            .filter(([label, _]) => label === preferredLocationsTitle)
            .map(([_, items]) => items)
            .flat()
        },
        {
          title: realEstateListingsTitle,
          active: true,
          items: newGroupedEntries
            .filter(([label, _]) => label === realEstateListingsTitle)
            .map(([_, items]) => items)
            .flat()
        },
        ...newGroupedEntries
          .filter(
            ([label, _]) =>
              label !== preferredLocationsTitle &&
              label !== realEstateListingsTitle
          )
          .map(([title, items]) => ({
            title,
            active: true,
            items
          }))
      ];

      setGroupedEntries(combinedGroupEntries);
    }
  }, [
    searchResponseString,
    searchContextState.preferredLocations,
    realEstateState.listings,
    activeMeans
  ]);

  if (!searchContextState.searchResponse?.routingProfiles) {
    history.push("/");
    return null;
  }

  const toggleEntityGroup = (title: string) => {
    const newGroups = groupedEntries.map(ge =>
      ge.title !== title
        ? ge
        : {
            ...ge,
            active: !ge.active
          }
    );
    setGroupedEntries(newGroups);
  };

  const toggleAllEntityGroups = () => {
    const someActive = groupedEntries.some(ge => ge.active);
    const newGroups = groupedEntries.map(ge => ({
      ...ge,
      active: !someActive
    }));
    setGroupedEntries(newGroups);
  };

  const highlightZoomEntity = (item: ResultEntity) => {
    searchContextDispatch({
      type: SearchContextActions.CENTER_ZOOM_COORDINATES,
      payload: { center: item.coordinates, zoom: 18 }
    });
    searchContextDispatch({
      type: SearchContextActions.SET_HIGHLIGHT_ID,
      payload: item.id
    });
  };

  const toggleRoutesToEntity = async (
    origin: ApiCoordinates,
    item: ResultEntity
  ) => {
    const existing = routes.find(
      r =>
        r.coordinates.lat === item.coordinates.lat &&
        r.coordinates.lng === item.coordinates.lng
    );
    if (existing) {
      setRoutes(prevState => [
        ...prevState.filter(
          r =>
            r.coordinates.lat !== item.coordinates.lat &&
            r.coordinates.lng !== item.coordinates.lng
        ),
        {
          ...existing,
          show: !existing.show
        }
      ]);
    } else {
      const routesResult = await fetchRoutes({
        meansOfTransportation: [
          MeansOfTransportation.BICYCLE,
          MeansOfTransportation.CAR,
          MeansOfTransportation.WALK
        ],
        origin: origin,
        destinations: [
          {
            title: item.name || "" + item.id,
            coordinates: item.coordinates
          }
        ]
      });
      setRoutes(prev => [
        ...prev,
        {
          routes: routesResult[0].routes,
          title: routesResult[0].title,
          show: true,
          coordinates: item.coordinates
        }
      ]);
    }
  };

  const toggleTransitRoutesToEntity = async (
    origin: ApiCoordinates,
    item: ResultEntity
  ) => {
    const existing = transitRoutes.find(
      r =>
        r.coordinates.lat === item.coordinates.lat &&
        r.coordinates.lng === item.coordinates.lng
    );
    if (existing) {
      setTransitRoutes(prevState => [
        ...prevState.filter(
          r =>
            r.coordinates.lat !== item.coordinates.lat &&
            r.coordinates.lng !== item.coordinates.lng
        ),
        {
          ...existing,
          show: !existing.show
        }
      ]);
    } else {
      const routesResult = await fetchTransitRoutes({
        origin: origin,
        destinations: [
          {
            title: item.name || "" + item.id,
            coordinates: item.coordinates
          }
        ]
      });
      setTransitRoutes(prev => [
        ...prev,
        {
          route: routesResult[0].route,
          title: routesResult[0].title,
          show: true,
          coordinates: item.coordinates
        }
      ]);
    }
  };

  const ActionsTop: React.FunctionComponent = () => {
    return (
      <>
        <li>
          <button
            type="button"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActions.SET_PRINTING_ACTIVE,
                payload: true
              });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Umgebungsanalyse PDF
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              hasFullyCustomizableExpose
                ? searchContextDispatch({
                    type: SearchContextActions.SET_PRINTING_DOCX_ACTIVE,
                    payload: true
                  })
                : userDispatch({
                    type: UserActions.SET_SUBSCRIPTION_MODAL_PROPS,
                    payload: {
                      open: true,
                      message: subscriptionUpgradeFullyCustomizableExpose
                    }
                  });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Umgebungsanalyse Docx
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActions.SET_PRINTING_CHEATSHEET_ACTIVE,
                payload: true
              });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Spickzettel PDF
          </button>
        </li>
        <li>
          <a
            onClick={() => {
              window.localStorage.setItem(
                localStorageSearchContext,
                JSON.stringify(searchContextState)
              );
            }}
            target="_blank"
            href="/potential-customers/from-result"
            className="btn btn-link"
          >
            <img src={plusIcon} alt="pdf-icon" /> Interessent anlegen
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              window.localStorage.setItem(
                localStorageSearchContext,
                JSON.stringify(searchContextState)
              );
            }}
            target="_blank"
            href="/real-estates/from-result"
            className="btn btn-link"
          >
            <img src={plusIcon} alt="pdf-icon" /> Objekt anlegen
          </a>
        </li>
      </>
    );
  };

  const MapMenuMobileBtn: React.FunctionComponent = () => {
    return (
      <button
        type="button"
        className="mobile-menu-btn"
        onMouseDown={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {!mobileMenuOpen && <img src={openMenuIcon} alt="icon-menu" />}
        {mobileMenuOpen && <img src={closeMenuIcon} alt="icon-menu-close" />}
      </button>
    );
  };

  return (
    <>
      <DefaultLayout
        title="Umgebungsanalyse"
        withHorizontalPadding={false}
        actionTop={<ActionsTop />}
        actionBottom={[<BackButton key="back-button" to="/" />]}
      >
        <TourStarter tour="result" />
        <div className="search-result-container">
          <div className="relative flex-1">
            <MapNavBar
              transportationParams={searchContextState.transportationParams}
              activeMeans={activeMeans}
              availableMeans={availableMeans}
              onMeansChange={newValues => setActiveMeans(newValues)}
            />
            <Map
              searchResponse={searchContextState.searchResponse}
              searchAddress={searchContextState?.placesLocation?.label}
              entities={filteredEntites}
              groupedEntities={groupedEntries}
              highlightId={searchContextState.highlightId}
              means={{
                byFoot: activeMeans.includes(MeansOfTransportation.WALK),
                byBike: activeMeans.includes(MeansOfTransportation.BICYCLE),
                byCar: activeMeans.includes(MeansOfTransportation.CAR)
              }}
              mapCenter={
                searchContextState.mapCenter ?? searchContextState.location
              }
              mapZoomLevel={searchContextState.mapZoomLevel ?? defaultMapZoom}
              printingActive={searchContextState.printingActive}
              printingCheatsheetActive={
                searchContextState.printingCheatsheetActive
              }
              routes={routes}
              transitRoutes={transitRoutes}
            />
          </div>
          <MapMenuMobileBtn />
          <MapMenu
            mobileMenuOpen={mobileMenuOpen}
            censusData={censusDataAvailable && searchContextState.censusData}
            federalElectionData={
              federalElectionDataAvailable &&
              searchContextState.federalElectionData
            }
            particlePollutionData={
              particlePollutionDataAvailable &&
              searchContextState.particlePollutionData
            }
            groupedEntries={groupedEntries}
            toggleEntryGroup={toggleEntityGroup}
            toggleAllEntryGroups={toggleAllEntityGroups}
            highlightZoomEntity={highlightZoomEntity}
            toggleRoute={item =>
              toggleRoutesToEntity(searchContextState.location, item)
            }
            routes={routes}
            toggleTransitRoute={item =>
              toggleTransitRoutesToEntity(searchContextState.location, item)
            }
            transitRoutes={transitRoutes}
            searchAddress={searchContextState?.placesLocation?.label}
            resetPosition={() =>
              searchContextDispatch({
                type: SearchContextActions.SET_MAP_CENTER,
                payload:
                  searchContextState?.searchResponse?.centerOfInterest
                    ?.coordinates
              })
            }
            user={userState.user}
            openUpgradeSubscriptionModal={message =>
              userDispatch({
                type: UserActions.SET_SUBSCRIPTION_MODAL_PROPS,
                payload: { open: true, message }
              })
            }
          />
        </div>
      </DefaultLayout>
      {searchContextState.printingActive && (
        <ExportModal
          entities={filteredEntites}
          groupedEntries={groupedEntries}
          censusData={searchContextState.censusData!}
        />
      )}
      {searchContextState.printingCheatsheetActive && (
        <ExportModal
          entities={filteredEntites}
          groupedEntries={groupedEntries}
          censusData={searchContextState.censusData!}
          exportType="CHEATSHEET"
        />
      )}
      {searchContextState.printingDocxActive && (
        <ExportModal
          entities={filteredEntites}
          groupedEntries={groupedEntries}
          censusData={searchContextState.censusData!}
          exportType="EXPOSE_DOCX"
        />
      )}
    </>
  );
};
export default SearchResultPage;
