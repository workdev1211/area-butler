import { FC, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../context/SearchContext";
import { ConfigContext } from "../../../context/ConfigContext";
import { UserActionTypes, UserContext } from "../../../context/UserContext";
import { invertFilter } from "../../../shared/shared.constants";
import pdfIcon from "../../../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import ExportModal from "../../../export/ExportModal";
import OnePageExportModal from "../../../export/one-page/OnePageExportModal";
import { setBackgroundColor } from "../../../shared/shared.functions";
import { ExportTypeEnum } from "../../../../../shared/types/export";
import { statsExportUnlockText } from "../../../../../shared/constants/on-office/on-office-products";
import reportsIcon from "../../../assets/icons/map-menu/09-reporte.svg";
import {
  IntegrationActionTypeEnum,
  TUnlockIntProduct,
} from "../../../../../shared/types/integration";
import { useTools } from "../../../hooks/tools";
import { FeatureTypeEnum } from "../../../../../shared/types/types";

const subscriptionUpgradeFullyCustomizableExpose =
  "Das vollständig konfigurierbare Expose als Docx ist im aktuellen Abonnement nicht enthalten.";

interface ILocationExportProps {
  snapshotId: string;
  hasOpenAiFeature: boolean;
  backgroundColor: string;
  performUnlock?: TUnlockIntProduct;
}

const LocationExport: FC<ILocationExportProps> = ({
  snapshotId,
  hasOpenAiFeature,
  backgroundColor,
  performUnlock,
}) => {
  const { t } = useTranslation();
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userDispatch } = useContext(UserContext);

  const [isExportAvailable, setIsExportAvailable] = useState(false);
  const [exportType, setExportType] = useState<ExportTypeEnum>();
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  const { checkIsFeatAvailable } = useTools();
  const isIntegration = !!integrationType;

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

    const isExportAvailable = checkIsFeatAvailable(
      isOnePageExport ? FeatureTypeEnum.ONE_PAGE : FeatureTypeEnum.OTHER_EXPORT
    );

    if (isExportAvailable) {
      performExport();
      return;
    }

    if (isIntegration && performUnlock) {
      const actionType = isOnePageExport
        ? IntegrationActionTypeEnum.UNLOCK_ONE_PAGE
        : IntegrationActionTypeEnum.UNLOCK_STATS_EXPORT;

      performUnlock(
        isOnePageExport
          ? t(IntlKeys.snapshotEditor.dataTab.unlockLocationExpose)
          : statsExportUnlockText,
        actionType
      );
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

    setExportType(undefined);

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

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isReportsOpen ? " collapse-open" : " collapse-closed")
      }
    >
      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsReportsOpen(!isReportsOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={reportsIcon} alt="reports-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">
              <div className="collapse-title-text-1">
                {t(IntlKeys.snapshotEditor.dataTab.reportsAndLocationExpose)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="collapse-content">
        <ul>
          <li>
            <h3
              className="max-w-fit items-center cursor-pointer"
              onClick={() => {
                setExportType(ExportTypeEnum.ONE_PAGE);
              }}
            >
              <img
                className="w-4 h-4"
                style={invertFilter}
                src={pdfIcon}
                alt="pdf"
              />
              <span>
                {t(IntlKeys.snapshotEditor.dataTab.generateLocationExpose)}
              </span>
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
                className="w-4 h-4"
                style={invertFilter}
                src={pdfIcon}
                alt="pdf"
              />
              {t(IntlKeys.snapshotEditor.dataTab.environmentalAnalysisPDF)}
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
                className="w-4 h-4"
                style={invertFilter}
                src={pdfIcon}
                alt="pdf"
              />
              {t(IntlKeys.snapshotEditor.dataTab.overviewPDF)}
            </h3>
          </li>
        </ul>

        {isExportAvailable &&
          exportType &&
          exportType !== ExportTypeEnum.ONE_PAGE && (
            <ExportModal
              activeMeans={searchContextState.responseActiveMeans}
              censusData={searchContextState.censusData!}
              exportType={exportType}
            />
          )}

        {isExportAvailable && exportType === ExportTypeEnum.ONE_PAGE && (
          <OnePageExportModal
            snapshotId={snapshotId}
            hasOpenAiFeature={hasOpenAiFeature}
          />
        )}
      </div>
    </div>
  );
};

export default LocationExport;
