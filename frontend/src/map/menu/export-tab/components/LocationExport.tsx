import { FunctionComponent, useContext, useEffect, useState } from "react";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../context/SearchContext";
import { ConfigContext } from "../../../../context/ConfigContext";
import { UserActionTypes, UserContext } from "../../../../context/UserContext";
import { invertFilter } from "../../../../shared/shared.constants";
import pdfIcon from "../../../../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import ExportModal from "../../../../export/ExportModal";
import OnePageExportModal from "../../../../export/one-page/OnePageExportModal";
import { deriveEntityGroupsByActiveMeans } from "../../../../shared/shared.functions";
import { OnOfficeIntActTypesEnum } from "../../../../../../shared/types/on-office";
import { useIntegrationTools } from "../../../../hooks/integrationtools";
import ConfirmationModal from "../../../../components/ConfirmationModal";
import { ExportTypeEnum } from "../../../../../../shared/types/export";
import { statsExportUnlockText } from "../../../../../../shared/constants/on-office/products";

const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

interface ILocationExportProps {
  snapshotId: string;
  hasOpenAiFeature: boolean;
}

const LocationExport: FunctionComponent<ILocationExportProps> = ({
  snapshotId,
  hasOpenAiFeature,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const {
    userState: { user },
    userDispatch,
  } = useContext(UserContext);

  const { checkProdContAvailByAction, unlockProduct } = useIntegrationTools();

  const [unlockParams, setUnlockParams] = useState<{
    isShownConfirmModal: boolean;
    confirmModalText?: string;
    actionType?: any;
  }>({ isShownConfirmModal: false });
  const [exportType, setExportType] = useState<ExportTypeEnum>();
  const [isExportAvailable, setIsExportAvailable] = useState(false);

  const isIntegration = !!integrationType;
  const realEstateListing = searchContextState.realEstateListing;

  const performExport = (): void => {
    if (!exportType) {
      return;
    }

    switch (exportType) {
      case ExportTypeEnum.EXPOSE: {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
          payload: true,
        });
        break;
      }

      case ExportTypeEnum.EXPOSE_DOCX: {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
          payload: true,
        });
        break;
      }

      case ExportTypeEnum.CHEATSHEET: {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
          payload: true,
        });
        break;
      }

      case ExportTypeEnum.ONE_PAGE: {
        searchContextDispatch({
          type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
          payload: true,
        });
        break;
      }
    }

    setIsExportAvailable(true);
  };

  useEffect(() => {
    if (!exportType) {
      return;
    }

    const isOnePageExport = exportType === ExportTypeEnum.ONE_PAGE;

    const isExportAvailForIntUser =
      isIntegration &&
      (isOnePageExport
        ? realEstateListing?.isOnePageExportActive
        : realEstateListing?.isStatsFullExportActive);

    if (
      isExportAvailForIntUser ||
      !!user?.subscription?.config.appFeatures.fullyCustomizableExpose
    ) {
      performExport();
      return;
    }

    if (isIntegration) {
      const actionType = isOnePageExport
        ? OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE
        : OnOfficeIntActTypesEnum.UNLOCK_STATS_EXPORT;

      if (checkProdContAvailByAction(actionType)) {
        setUnlockParams({
          actionType,
          isShownConfirmModal: true,
          confirmModalText: isOnePageExport
            ? "Lage-Exposé freischalten?"
            : statsExportUnlockText,
        });
      }
    }

    if (!isIntegration) {
      userDispatch({
        type: UserActionTypes.SET_SUBSCRIPTION_MODAL_PROPS,
        payload: {
          open: true,
          message: subscriptionUpgradeFullyCustomizableExpose,
        },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportType]);

  useEffect(() => {
    if (
      !searchContextState.printingActive &&
      !searchContextState.printingDocxActive &&
      !searchContextState.printingCheatsheetActive &&
      !searchContextState.printingOnePageActive
    ) {
      setExportType(undefined);
      setIsExportAvailable(false);
    }
  }, [
    searchContextState.printingActive,
    searchContextState.printingDocxActive,
    searchContextState.printingCheatsheetActive,
    searchContextState.printingOnePageActive,
  ]);

  const entityGroups = deriveEntityGroupsByActiveMeans(
    searchContextState.responseGroupedEntities,
    searchContextState.responseActiveMeans
  );

  const resultingGroups = entityGroups.map((g) => g.items).flat();

  return (
    <>
      {unlockParams.isShownConfirmModal && (
        <ConfirmationModal
          closeModal={() => {
            setUnlockParams({ isShownConfirmModal: false });
          }}
          onConfirm={async () => {
            await unlockProduct(unlockParams.actionType);
            performExport();
          }}
          text={unlockParams.confirmModalText!}
        />
      )}

      <ul>
        <li>
          <h3
            className="max-w-fit items-center cursor-pointer"
            onClick={() => {
              setExportType(ExportTypeEnum.ONE_PAGE);
            }}
          >
            <img
              className="w-6 h-6"
              style={invertFilter}
              src={pdfIcon}
              alt="pdf"
            />
            <span>Lage Exposé generieren</span>
            {/*<span className="badge badge-primary">NEU</span>*/}
          </h3>
        </li>
        <li>
          <h3
            className="max-w-fit items-center cursor-pointer"
            onClick={() => {
              setExportType(ExportTypeEnum.EXPOSE);
            }}
          >
            <img
              className="w-6 h-6"
              style={invertFilter}
              src={pdfIcon}
              alt="pdf"
            />
            Umfeldanalyse PDF
          </h3>
        </li>
        <li>
          <h3
            className="max-w-fit items-center cursor-pointer"
            onClick={() => {
              setExportType(ExportTypeEnum.EXPOSE_DOCX);
            }}
          >
            <img
              className="w-6 h-6"
              style={invertFilter}
              src={pdfIcon}
              alt="pdf"
            />
            Umfeldanalyse DOC
          </h3>
        </li>
        <li>
          <h3
            className="max-w-fit items-center cursor-pointer"
            onClick={() => {
              setExportType(ExportTypeEnum.CHEATSHEET);
            }}
          >
            <img
              className="w-6 h-6"
              style={invertFilter}
              src={pdfIcon}
              alt="pdf"
            />
            Überblick PDF
          </h3>
        </li>
      </ul>

      {isExportAvailable &&
        exportType &&
        exportType !== ExportTypeEnum.ONE_PAGE && (
          <ExportModal
            activeMeans={searchContextState.responseActiveMeans}
            entities={resultingGroups}
            groupedEntries={entityGroups}
            censusData={searchContextState.censusData!}
            snapshotToken={searchContextState.responseToken}
            exportType={exportType}
          />
        )}

      {isExportAvailable && exportType === ExportTypeEnum.ONE_PAGE && (
        <OnePageExportModal
          entityGroups={entityGroups}
          snapshotToken={searchContextState.responseToken}
          snapshotId={snapshotId}
          hasOpenAiFeature={hasOpenAiFeature}
        />
      )}
    </>
  );
};

export default LocationExport;
