import { FunctionComponent, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DefaultLayout from "../layout/defaultLayout";
import plusIcon from "../assets/icons/icons-16-x-16-outline-ic-plus.svg";
import uploadIcon from "../assets/icons/upload_file.svg";
import syncIcon from "../assets/icons/sync.svg";
import { ApiRealEstateListing } from "../../../shared/types/real-estate";
import TourStarter from "tour/TourStarter";
import { UserActionTypes, UserContext } from "context/UserContext";
import {
  ApiSearchResultSnapshotResponse,
  ApiTourNamesEnum,
} from "../../../shared/types/types";
import EmbeddableMapsModal from "components/EmbeddableMapsModal";
import CsvImportModal from "../real-estates/CsvImportModal";
import { ConfigContext } from "../context/ConfigContext";
import { useRealEstateData } from "../hooks/realestatedata";
import CrmImportModal from "../real-estates/CrmImportModal";
import { useLocationData } from "../hooks/locationdata";
import RealEstatesTableV2 from "../real-estates/table/RealEstatesTableV2";
import { RealEstateContext } from "../context/RealEstateContext";
import IntegrationSyncModal from "../real-estates/IntegrationSyncModal";
import { useGoogleMapsApi } from "../hooks/google";
import { LoadingMessage } from "../components/Loading";

const RealEstatesPage: FunctionComponent = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { integrationType } = useContext(ConfigContext);
  const {
    realEstateState: { listings },
  } = useContext(RealEstateContext);

  const { fetchSnapshots } = useLocationData();
  const { fetchRealEstates } = useRealEstateData();
  const isLoadedGoogleMapsApi = useGoogleMapsApi();

  const [realEstateSnapshots, setRealEstateSnapshots] = useState<
    ApiSearchResultSnapshotResponse[]
  >([]);
  const [isShownSnapshotsModal, setIsShownSnapshotsModal] = useState(false);
  const [isShownCsvImportModal, setIsShownCsvImportModal] = useState(false);
  const [isShownCrmImportModal, setIsShownCrmImportModal] = useState(false);
  const [isShownIntSyncModal, setIsShownIntSyncModal] = useState(false);

  const isIntegration = !!integrationType;
  const user = userState.user!;
  const hasSubscription = isIntegration || !!user?.subscription;
  const hasHtmlSnippet =
    isIntegration ||
    (hasSubscription && user?.subscription!.config.appFeatures.htmlSnippet);
  const hasApiConnections = !!user?.apiConnections;

  useEffect(() => {
    if (!hasHtmlSnippet) {
      return;
    }

    const getSnapshots = async (): Promise<void> => {
      const embeddableMaps = await fetchSnapshots();

      userDispatch({
        type: UserActionTypes.SET_EMBEDDABLE_MAPS,
        payload: embeddableMaps,
      });
    };

    void getSnapshots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    void fetchRealEstates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoadedGoogleMapsApi) {
    return <LoadingMessage />;
  }

  const openSnapshotsModal = (realEstate: ApiRealEstateListing): void => {
    const { lat, lng } = realEstate.coordinates!;

    setRealEstateSnapshots(
      userState.embeddableMaps.filter(
        (map) =>
          map.snapshot.location.lat === lat && map.snapshot.location.lng === lng
      )
    );

    setIsShownSnapshotsModal(true);
  };

  const ActionsTop: FunctionComponent = () => {
    return (
      <>
        <li>
          <Link to="/real-estates/new" className="btn btn-link">
            <img src={plusIcon} alt="pdf-icon" /> Objekt anlegen
          </Link>
        </li>

        <li>
          <button
            className="btn btn-link"
            onClick={() => {
              setIsShownCsvImportModal(true);
            }}
          >
            <img className="invert" src={uploadIcon} alt="upload-icon" />
            <div className="cursor-pointer">Import aus CSV-Datei</div>
          </button>
        </li>

        {hasApiConnections && (
          <li>
            <button
              className="btn btn-link"
              onClick={() => {
                setIsShownCrmImportModal(true);
              }}
            >
              <img className="invert" src={uploadIcon} alt="import-icon" />
              <div className="cursor-pointer">CRM synchronisieren</div>
            </button>
          </li>
        )}
      </>
    );
  };

  const ActionsTopInt: FunctionComponent = () => {
    return (
      <li>
        <button
          className="btn btn-link"
          onClick={() => {
            setIsShownIntSyncModal(true);
          }}
        >
          <img className="invert h-[16px]" src={syncIcon} alt="sync-icon" />
          <div className="cursor-pointer">Sync-Immobilien</div>
        </button>
      </li>
    );
  };

  return (
    <DefaultLayout
      title="Meine Immobilien"
      withHorizontalPadding={false}
      actionsTop={isIntegration ? <ActionsTopInt /> : <ActionsTop />}
    >
      <TourStarter tour={ApiTourNamesEnum.REAL_ESTATES} />

      {isShownSnapshotsModal && (
        <EmbeddableMapsModal
          setShowModal={setIsShownSnapshotsModal}
          embeddableMaps={realEstateSnapshots}
        />
      )}

      {isShownCsvImportModal && (
        <CsvImportModal
          closeModal={async () => {
            await fetchRealEstates();
            setIsShownCsvImportModal(false);
          }}
          fileFormat={user.subscription?.config.appFeatures.csvFileFormat}
        />
      )}

      {isShownCrmImportModal && (
        <CrmImportModal
          apiConnections={user.apiConnections!}
          closeModal={() => {
            setIsShownCrmImportModal(false);
          }}
        />
      )}

      {isShownIntSyncModal && (
        <IntegrationSyncModal
          closeModal={(isCompletedSync?: boolean) => {
            setIsShownIntSyncModal(false);

            if (isCompletedSync) {
              void fetchRealEstates();
            }
          }}
        />
      )}

      {listings.length > 0 && (
        <div data-tour="real-estates-table">
          {/*<RealEstatesTable openSnapshotsModal={openSnapshotsModal} />*/}
          <RealEstatesTableV2 openSnapshotsModal={openSnapshotsModal} />
        </div>
      )}
    </DefaultLayout>
  );
};

export default RealEstatesPage;
