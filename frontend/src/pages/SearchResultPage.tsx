import BusyModal from "components/BusyModal";
import { RealEstateContext } from "context/RealEstateContext";
import { UserActionTypes, UserContext } from "context/UserContext";
import ExportModal from "export/ExportModal";
import { useHttp } from "hooks/http";
import { useRouting } from "hooks/routing";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  deriveEntityGroupsByActiveMeans,
  toastError
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import { localStorageSearchContext } from "../../../shared/constants/constants";
import { ApiPreferredLocation } from "../../../shared/types/potential-customer";
import { EntityRoute, EntityTransitRoute } from "../../../shared/types/routing";
import {
  ApiSearchResultSnapshotResponse,
  ApiUser,
  ApiUserRequests,
  MeansOfTransportation
} from "../../../shared/types/types";
import pdfIcon from "../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import SearchResultContainer from "../components/SearchResultContainer";
import { ConfigContext } from "../context/ConfigContext";
import {
  SearchContext,
  SearchContextActionTypes
} from "../context/SearchContext";
import BackButton from "../layout/BackButton";
import DefaultLayout from "../layout/defaultLayout";

export const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

const SearchResultPage: React.FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );
  const { mapBoxAccessToken } = useContext(ConfigContext);
  const { realEstateState } = useContext(RealEstateContext);
  const { userState, userDispatch } = useContext(UserContext);

  const { get, post } = useHttp();
  const { fetchRoutes, fetchTransitRoutes } = useRouting();
  const [busyModalOpen, setBusyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserRequests = async () => {
      const latestUserRequests: ApiUserRequests = (
        await get<ApiUserRequests>("/api/location/latest-user-requests")
      ).data;
      userDispatch({
        type: UserActionTypes.SET_LATEST_USER_REQUESTS,
        payload: latestUserRequests
      });
    };

    fetchUserRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [true]);

  const user: ApiUser = userState.user!;
  const hasFullyCustomizableExpose =
    user.subscriptionPlan?.config.appFeatures.fullyCustomizableExpose;

  const history = useHistory();

  if (!searchContextState.searchResponse?.routingProfiles) {
    history.push("/");
    return null;
  }

  const ActionsTop: React.FunctionComponent = () => {
    return (
      <>
        <li>
          <button
            type="button"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                payload: true
              });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Export Analyse PDF
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              hasFullyCustomizableExpose
                ? searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
                    payload: true
                  })
                : userDispatch({
                    type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                    payload: {
                      open: true,
                      message: subscriptionUpgradeFullyCustomizableExpose
                    }
                  });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Export Analyse DOCX
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
                payload: true
              });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Kurzusammenfassung PDF
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
            <img src={plusIcon} alt="pdf-icon" /> Zielgruppe speichern
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
            <img src={plusIcon} alt="pdf-icon" /> Adresse speichern
          </a>
        </li>
        <li>
          <button
            type="button"
            onClick={async () => {
              setBusyModalOpen(true);

              try {
                const routes: EntityRoute[] = [];
                const transitRoutes: EntityTransitRoute[] = [];
                const location = searchContextState.location!;
                const preferredLocations: ApiPreferredLocation[] =
                  searchContextState.preferredLocations || [];

                for (const preferredLocation of preferredLocations) {
                  const routesResult = await fetchRoutes({
                    meansOfTransportation: [
                      MeansOfTransportation.BICYCLE,
                      MeansOfTransportation.CAR,
                      MeansOfTransportation.WALK
                    ],
                    origin: location,
                    destinations: [
                      {
                        title: preferredLocation.title,
                        coordinates: preferredLocation.coordinates!
                      }
                    ]
                  });
                  routes.push({
                    routes: routesResult[0].routes,
                    title: routesResult[0].title,
                    show: [],
                    coordinates: preferredLocation.coordinates!
                  });

                  const transitRoutesResult = await fetchTransitRoutes({
                    origin: location,
                    destinations: [
                      {
                        title: preferredLocation.title,
                        coordinates: preferredLocation.coordinates!
                      }
                    ]
                  });
                  if (
                    transitRoutesResult.length &&
                    transitRoutesResult[0].route
                  ) {
                    transitRoutes.push({
                      route: transitRoutesResult[0].route,
                      title: transitRoutesResult[0].title,
                      show: false,
                      coordinates: preferredLocation.coordinates!
                    });
                  }
                }

                const response: ApiSearchResultSnapshotResponse = (
                  await post<ApiSearchResultSnapshotResponse>(
                    "/api/location/snapshot",
                    {
                      placesLocation: searchContextState.placesLocation,
                      location,
                      transportationParams:
                        searchContextState.transportationParams,
                      localityParams: searchContextState.localityParams,
                      searchResponse: searchContextState.searchResponse,
                      realEstateListings: realEstateState.listings,
                      preferredLocations,
                      routes,
                      transitRoutes
                    }
                  )
                ).data;
                history.push(`snippet-editor/${response.id}`);
              } catch (e) {
                console.error(e);
                toastError("Fehler beim Öffnen des Editors");
              } finally {
                setBusyModalOpen(false);
              }
            }}
            className="btn btn-link"
          >
            <img src={plusIcon} alt="pdf-icon" /> Eigener Karten-Editor
          </button>
        </li>
      </>
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
        <BusyModal open={busyModalOpen} title="Öffne Editor..." />
        <SearchResultContainer
          mapBoxToken={mapBoxAccessToken}
          searchResponse={searchContextState.searchResponse}
          placesLocation={searchContextState.placesLocation}
          location={
            searchContextState.mapCenter ?? searchContextState.location!
          }
          mapZoomLevel={searchContextState.mapZoomLevel!}
          user={user}
          userDispatch={userDispatch}
        />
      </DefaultLayout>
      {searchContextState.printingActive && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )
            .map(g => g.items)
            .flat()}
          groupedEntries={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )}
          censusData={searchContextState.censusData!}
        />
      )}
      {searchContextState.printingCheatsheetActive && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )
            .map(g => g.items)
            .flat()}
          groupedEntries={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )}
          censusData={searchContextState.censusData!}
          exportType="CHEATSHEET"
        />
      )}
      {searchContextState.printingDocxActive && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )
            .map(g => g.items)
            .flat()}
          groupedEntries={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )}
          censusData={searchContextState.censusData!}
          exportType="EXPOSE_DOCX"
        />
      )}
    </>
  );
};
export default SearchResultPage;
