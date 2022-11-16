import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import BusyModal, { IBusyModalItem } from "components/BusyModal";
import { UserActionTypes, UserContext } from "context/UserContext";
import ExportModal from "export/ExportModal";
import { useHttp } from "hooks/http";
import {
  deriveEntityGroupsByActiveMeans,
  toastError,
} from "shared/shared.functions";
import TourStarter from "tour/TourStarter";
import { localStorageSearchContext } from "../../../shared/constants/constants";
import { ApiUser, ApiUserRequests } from "../../../shared/types/types";
import SearchResultContainer from "../components/SearchResultContainer";
import { ConfigContext } from "../context/ConfigContext";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import BackButton from "../layout/BackButton";
import DefaultLayout from "../layout/defaultLayout";
import pdfIcon from "../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import arrowIcon from "../assets/icons/icons-16-x-16-outline-ic-back.svg";
import { useAnalysis } from "../hooks/analysis";
import { ApiSubscriptionPlanType } from "../../../shared/types/subscription-plan";

export const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

// TODO try to fix the following error
// Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
const SearchResultPage: FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { mapBoxAccessToken } = useContext(ConfigContext);
  const { userState, userDispatch } = useContext(UserContext);

  const { get } = useHttp();
  const { createSnapshot } = useAnalysis();

  const [isShownBusyModal, setIsShownBusyModal] = useState(false);
  const [busyModalItems, setBusyModalItems] = useState<IBusyModalItem[]>([]);

  useEffect(() => {
    const fetchUserRequests = async () => {
      const latestUserRequests: ApiUserRequests = (
        await get<ApiUserRequests>("/api/location/latest-user-requests")
      ).data;

      userDispatch({
        type: UserActionTypes.SET_LATEST_USER_REQUESTS,
        payload: latestUserRequests,
      });
    };

    void fetchUserRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user: ApiUser = userState.user!;
  const hasFullyCustomizableExpose =
    user.subscription?.config.appFeatures.fullyCustomizableExpose;

  const history = useHistory();
  const currentLocation = useLocation();

  if (!searchContextState.searchResponse?.routingProfiles) {
    history.push("/");

    return null;
  }

  const ActionsTop: FunctionComponent = () => {
    return (
      <>
        <li>
          <button
            type="button"
            onClick={() => {
              searchContextDispatch({
                type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                payload: true,
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
                    payload: true,
                  })
                : userDispatch({
                    type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
                    payload: {
                      open: true,
                      message: subscriptionUpgradeFullyCustomizableExpose,
                    },
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
                payload: true,
              });
            }}
            className="btn btn-link"
          >
            <img src={pdfIcon} alt="pdf-icon" /> Export Überblick PDF
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
            <img src={plusIcon} alt="pdf-icon" /> Objekt anlegen
          </a>
        </li>
        <li>
          <button
            type="button"
            onClick={async () => {
              setIsShownBusyModal(true);
              const items: IBusyModalItem[] = [];

              try {
                const { id } = await createSnapshot(
                  items,
                  setBusyModalItems,
                  searchContextState.searchResponse!,
                  user.email
                );

                history.push(`snippet-editor/${id}`, {
                  from: currentLocation.pathname,
                });
              } catch (e) {
                console.error(e);
                toastError("Fehler beim Öffnen des Editors");
              } finally {
                setIsShownBusyModal(false);
                setBusyModalItems([]);
              }
            }}
            className="btn btn-link"
          >
            <img
              src={arrowIcon}
              alt="pdf-icon"
              style={{ transform: "scale(-1, 1)" }}
            />{" "}
            Karten-Editor
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
        actionsTop={<ActionsTop />}
        actionsBottom={[<BackButton key="back-button" to="/" />]}
        timelineStep={2}
      >
        <TourStarter tour="result" />
        {isShownBusyModal && (
          <BusyModal
            items={busyModalItems}
            itemCount={
              searchContextState.preferredLocations?.length
                ? searchContextState.preferredLocations.length * 2 + 1
                : 1
            }
            isAnimated={true}
            isRandomMessages={true}
          />
        )}
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
          isTrial={user.subscription?.type === ApiSubscriptionPlanType.TRIAL}
        />
      </DefaultLayout>
      {searchContextState.printingActive && (
        <ExportModal
          activeMeans={searchContextState.responseActiveMeans}
          entities={deriveEntityGroupsByActiveMeans(
            searchContextState.responseGroupedEntities,
            searchContextState.responseActiveMeans
          )
            .map((g) => g.items)
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
            .map((g) => g.items)
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
            .map((g) => g.items)
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
