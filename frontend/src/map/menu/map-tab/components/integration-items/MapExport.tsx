// TODO REMOVE IN THE FUTURE

import { CSSProperties, FunctionComponent, useContext, useState } from "react";

import {
  setBackgroundColor,
  toastError,
  toastSuccess,
} from "../../../../../shared/shared.functions";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../../../../context/SearchContext";
import reportsIcon from "../../../../../assets/icons/map-menu/09-reporte.svg";
import pdfIcon from "../../../../../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import { EntityGroup } from "../../../../../shared/search-result.types";
import OnePageExportModal from "../../../../../export/one-page/OnePageExportModal";
import { OnOfficeIntActTypesEnum } from "../../../../../../../shared/types/on-office";
import ConfirmationModal from "../../../../../components/ConfirmationModal";
import {
  UserActionTypes,
  UserContext,
} from "../../../../../context/UserContext";
// import { useIntegrationTools } from "../../../../../hooks/integrationtools";
import { useHttp } from "../../../../../hooks/http";
import { ConfigContext } from "../../../../../context/ConfigContext";

interface IMapExportProps {
  groupedEntries: EntityGroup[];
}

const invertFilter: CSSProperties = { filter: "invert(100%)" };

const MapExport: FunctionComponent<IMapExportProps> = ({ groupedEntries }) => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userDispatch } = useContext(UserContext);

  const { post } = useHttp();
  // const { checkProdContAvailByAction } = useIntegrationTools();

  const [isMapExportOpen, setIsMapExportOpen] = useState(false);
  const [isShownModal, setIsShownModal] = useState(false);

  const realEstateListing = searchContextState.realEstateListing!;

  const unlockOnePageExport = async () => {
    try {
      await post<void>(
        `/api/real-estate-listing-int/unlock-one-page-export/${realEstateListing.id}`
      );

      toastSuccess("Das Produkt wurde erfolgreich gekauft!");
      setIsShownModal(false);

      // userDispatch({
      //   type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
      //   payload: {
      //     integrationType: integrationType!,
      //     actionType: OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE,
      //   },
      // });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
        payload: { ...realEstateListing, isOnePageExportActive: true },
      });

      searchContextDispatch({
        type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
        payload: true,
      });
    } catch (e) {
      toastError("Der Fehler ist aufgetreten!");
      console.error(e);
    }
  };

  const backgroundColor =
    searchContextState.responseConfig?.primaryColor ||
    "var(--primary-gradient)";

  return (
    <div
      className={
        "collapse collapse-arrow view-option" +
        (isMapExportOpen ? " collapse-open" : " collapse-closed")
      }
    >
      {isShownModal && (
        <ConfirmationModal
          closeModal={() => {
            setIsShownModal(false);
          }}
          onConfirm={unlockOnePageExport}
          text="Lage-Exposé freischalten?"
        />
      )}

      <div
        className="collapse-title"
        ref={(node) => {
          setBackgroundColor(node, backgroundColor);
        }}
        onClick={() => {
          setIsMapExportOpen(!isMapExportOpen);
        }}
      >
        <div className="collapse-title-container">
          <img src={reportsIcon} alt="reports-icon" />
          <div className="collapse-title-text">
            <div className="collapse-title-text-1">
              <div className="collapse-title-text-1 flex gap-2">
                Reporte und Lage Exposé
              </div>
            </div>
            <div className="collapse-title-text-2">
              Für Zahlen, Daten & Fakten zur Lage
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content">
        <div
          className="flex flex-col gap-5 py-5"
          style={{
            paddingLeft: "calc(var(--menu-image-w-h) + 0.75rem)",
            paddingRight: "calc(var(--menu-image-w-h) + 0.75rem)",
          }}
        >
          <h3
            className="flex max-w-fit items-center cursor-pointer gap-2"
            onClick={() => {
              if (realEstateListing.isOnePageExportActive) {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_ONE_PAGE_ACTIVE,
                  payload: true,
                });

                return;
              }

              // if (
              //   checkProdContAvailByAction(
              //     OnOfficeIntActTypesEnum.UNLOCK_ONE_PAGE
              //   )
              // ) {
              //   setIsShownModal(true);
              // }
            }}
          >
            <img
              className="w-6 h-6"
              style={invertFilter}
              src={pdfIcon}
              alt="pdf"
            />
            <span>Lage Exposé generieren</span>
          </h3>
        </div>

        {searchContextState.printingOnePageActive && (
          <OnePageExportModal
            entityGroups={groupedEntries}
            snapshotToken={searchContextState.responseToken}
            snapshotId={searchContextState.snapshotId!}
            hasOpenAiFeature={true}
          />
        )}
      </div>
    </div>
  );
};

export default MapExport;
