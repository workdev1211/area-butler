import React, { useContext, useEffect, useState } from "react";
import DefaultLayout from "../layout/defaultLayout";
import {
  SearchContext,
  SearchContextActionTypes
} from "../context/SearchContext";
import {
  ApiUser,
  ApiUserRequests,
  MeansOfTransportation
} from "../../../shared/types/types";
import { localStorageSearchContext } from "../../../shared/constants/constants";
import { useHistory } from "react-router-dom";
import ExportModal from "export/ExportModal";
import pdfIcon from "../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import BackButton from "../layout/BackButton";
import { RealEstateContext } from "context/RealEstateContext";
import { UserActionTypes, UserContext } from "context/UserContext";
import TourStarter from "tour/TourStarter";
import { useHttp } from "hooks/http";
import { ConfigContext } from "../context/ConfigContext";
import SearchResultContainer, {
  EntityGroup,
  ResultEntity
} from "../components/SearchResultContainer";

const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

const SearchResultPage: React.FunctionComponent = () => {
  const { searchContextState, searchContextDispatch } = useContext(
    SearchContext
  );

  const { mapBoxAccessToken } = useContext(ConfigContext);
  const { realEstateState } = useContext(RealEstateContext);
  const { userState, userDispatch } = useContext(UserContext);

  const [entities, setEntities] = useState<ResultEntity[]>([]);
  const [groupedEntities, setGroupedEntities] = useState<EntityGroup[]>([]);
  const [activeMeans, setActiveMeans] = useState<MeansOfTransportation[]>([]);

  const { get, post } = useHttp();

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
            <img src={pdfIcon} alt="pdf-icon" /> Umgebungsanalyse PDF
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
            <img src={pdfIcon} alt="pdf-icon" /> Umgebungsanalyse Docx
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
        <li>
          <button
            type="button"
            onClick={async () => {
              await post("/api/location/snapshot", {
                placesLocation: searchContextState.placesLocation,
                location: searchContextState.location,
                transportationParams: searchContextState.transportationParams,
                localityParams: searchContextState.localityParams,
                searchResponse: searchContextState.searchResponse
              });
            }}
            className="btn btn-link"
          >
            <img src={plusIcon} alt="pdf-icon" /> Snapshot anlegen
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
        <SearchResultContainer
          mapBoxToken={mapBoxAccessToken}
          searchResponse={searchContextState.searchResponse}
          transportationParams={searchContextState.transportationParams}
          placesLocation={searchContextState.placesLocation}
          location={
            searchContextState.mapCenter ?? searchContextState.location!
          }
          highlightId={searchContextState.highlightId!}
          mapZoomLevel={searchContextState.mapZoomLevel!}
          searchContextDispatch={searchContextDispatch}
          censusData={searchContextState.censusData}
          federalElectionData={searchContextState.federalElectionData}
          particlePollutionData={searchContextState.particlePollutionData}
          mapClippings={searchContextState.mapClippings}
          printingActive={searchContextState.printingActive}
          printingCheatsheetActive={searchContextState.printingCheatsheetActive}
          printingDocxActive={searchContextState.printingDocxActive}
          user={user}
          userDispatch={userDispatch}
          listings={realEstateState.listings}
          preferredLocations={searchContextState.preferredLocations}
          onEntitiesChange={setEntities}
          onGroupedEntitiesChange={setGroupedEntities}
          onActiveMeansChange={setActiveMeans}
        />
      </DefaultLayout>
      {searchContextState.printingActive && (
        <ExportModal
          activeMeans={activeMeans}
          entities={entities}
          groupedEntries={groupedEntities}
          censusData={searchContextState.censusData!}
        />
      )}
      {searchContextState.printingCheatsheetActive && (
        <ExportModal
          activeMeans={activeMeans}
          entities={entities}
          groupedEntries={groupedEntities}
          censusData={searchContextState.censusData!}
          exportType="CHEATSHEET"
        />
      )}
      {searchContextState.printingDocxActive && (
        <ExportModal
          activeMeans={activeMeans}
          entities={entities}
          groupedEntries={groupedEntities}
          censusData={searchContextState.censusData!}
          exportType="EXPOSE_DOCX"
        />
      )}
    </>
  );
};
export default SearchResultPage;
