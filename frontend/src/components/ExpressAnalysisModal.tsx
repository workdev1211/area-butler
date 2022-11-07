import { CSSProperties, FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";

import "./ExpressAnalysisModal.scss";
import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import {
  createCodeSnippet,
  createDirectLink,
  toastError,
  toastSuccess,
  deriveEntityGroupsByActiveMeans,
} from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import ExportModal from "../export/ExportModal";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../context/SearchContext";
import pdfIcon from "../assets/icons/icons-16-x-16-outline-ic-pdf.svg";
import copyIcon from "../assets/icons/copy.svg";
import screenshotIcon from "../assets/icons/screenshot.svg";
import closeIcon from "../assets/icons/icons-16-x-16-outline-ic-close.svg";
import aiIcon from "../assets/icons/ai.svg";
import SearchResultContainer from "./SearchResultContainer";
import { getQrCodeBase64 } from "../export/QrCode";
import downloadIcon from "../assets/icons/download.svg";
import { ApiSubscriptionPlanType } from "../../../shared/types/subscription-plan";
import OpenAiLocationDescriptionModal from "./OpenAiLocationDescriptionModal";

export interface ExpressAnalysisModalProps {
  snapshotResponse: ApiSearchResultSnapshotResponse;
  closeModal: () => void;
}

const ExpressAnalysisModal: FunctionComponent<ExpressAnalysisModalProps> = ({
  snapshotResponse,
  closeModal,
}) => {
  const { put } = useHttp();
  const history = useHistory();

  const { searchContextDispatch, searchContextState } =
    useContext(SearchContext);
  const { userDispatch, userState } = useContext(UserContext);

  const [description, setDescription] = useState(snapshotResponse?.description);
  const [isShownAiDescriptionModal, setIsShownAiDescriptionModal] =
    useState(false);
  const [isShownEmbeddedMapModal, setIsShownEmbeddedMapModal] = useState(false);

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const user = userState.user;

  const hasOpenAiFeature = user?.subscription?.config.appFeatures.openAi;

  const invertFilter: CSSProperties = { filter: "invert(100%)" };

  const handleCloseModal = async () => {
    closeModal();

    searchContextDispatch({
      type: SearchContextActionTypes.SET_SEARCH_BUSY,
      payload: false,
    });

    if (snapshotResponse.description !== description) {
      try {
        await put(`/api/location/snapshot/${snapshotResponse.id}/description`, {
          description,
        });

        userDispatch({
          type: UserActionTypes.SET_EMBEDDABLE_MAP_DESCRIPTION,
          payload: { id: snapshotResponse.id, description: description || "" },
        });
      } catch (err) {
        toastError("Fehler beim Ändern der Notiz");
        console.error(err);
      }
    }
  };

  // TODO split into ExpressAnalysis and the modal components

  // TODO think about memoizing the second subcomponent (!isShownOpenAiLocationModal)
  return (
    <>
      {hasOpenAiFeature && (
        <OpenAiLocationDescriptionModal
          isShownModal={isShownAiDescriptionModal}
          closeModal={() => {
            setIsShownAiDescriptionModal(false);
          }}
          searchResultSnapshotId={snapshotResponse.id}
        />
      )}

      {/*TODO MODAL COMPONENT*/}
      {!isShownAiDescriptionModal && (
        <div className="modal modal-open z-9999">
          <div className="modal-box flex flex-col">
            <div className="mb-3">Ihre One-Klick Ergebnisse:</div>

            {/*TODO move Export modals to another component*/}
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
                snapshotToken={snapshotResponse.token}
                censusData={searchContextState.censusData!}
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
                snapshotToken={snapshotResponse.token}
                censusData={searchContextState.censusData!}
                exportType="EXPOSE_DOCX"
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
                snapshotToken={snapshotResponse.token}
                censusData={searchContextState.censusData!}
                exportType="CHEATSHEET"
              />
            )}

            <h3
              className="flex max-w-fit items-center cursor-pointer gap-2"
              onClick={() => {
                setIsShownEmbeddedMapModal(true);
              }}
            >
              <img className="w-6 h-6" src={screenshotIcon} alt="screenshot" />
              Kartenausschnitte erstellen PNG
            </h3>

            <div style={{ borderTop: "1px solid black" }} />
            <h3
              className="flex max-w-fit items-center cursor-pointer gap-2"
              onClick={() => {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                  payload: true,
                });
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
            <h3
              className="flex max-w-fit items-center cursor-pointer gap-2"
              onClick={() => {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
                  payload: true,
                });
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
            <h3
              className="flex max-w-fit items-center cursor-pointer gap-2"
              onClick={() => {
                searchContextDispatch({
                  type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
                  payload: true,
                });
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

            {hasOpenAiFeature && (
              <>
                <div style={{ borderTop: "1px solid black" }} />
                <h3
                  className="flex max-w-fit items-center cursor-pointer gap-2"
                  onClick={() => {
                    setIsShownAiDescriptionModal(true);
                  }}
                >
                  <img
                    className="w-6 h-6"
                    style={invertFilter}
                    src={aiIcon}
                    alt="ai"
                  />
                  Lagetext generieren
                </h3>
              </>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Notizfeld</span>
              </label>
              <textarea
                className="textarea textarea-primary"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
              />
            </div>

            <h3
              className="flex max-w-fit items-center cursor-pointer gap-2"
              onClick={() => {
                copyCodeToClipBoard(createDirectLink(snapshotResponse.token));
              }}
            >
              <img className="w-6 h-6" src={copyIcon} alt="copy" />
              Hyperlink zur Vollbild-Karte URL
            </h3>
            <h3
              className="flex max-w-fit items-center cursor-pointer gap-2"
              onClick={async () => {
                saveAs(
                  await getQrCodeBase64(
                    createDirectLink(snapshotResponse.token)
                  ),
                  `${snapshotResponse.snapshot.placesLocation.label.replace(
                    /[\s|,]+/g,
                    "-"
                  )}-QR-Code.png`
                );
              }}
            >
              <img className="w-6 h-6" src={downloadIcon} alt="download" />
              QR Code
            </h3>
            <h3
              className="flex max-w-fit items-center cursor-pointer gap-2"
              onClick={() => {
                copyCodeToClipBoard(createCodeSnippet(snapshotResponse.token));
              }}
            >
              <img className="w-6 h-6" src={copyIcon} alt="copy" />
              Snippet (iFrame) HTML
            </h3>

            <div className="modal-action">
              <button
                className="btn btn-sm btn-default"
                onClick={async () => {
                  await handleCloseModal();
                }}
              >
                Schließen
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={async () => {
                  await handleCloseModal();
                  history.push(`snippet-editor/${snapshotResponse.id}`);
                }}
              >
                Editor öffnen
              </button>
            </div>
          </div>
        </div>
      )}

      {/*TODO EMBEDDED MODAL COMPONENT*/}
      {isShownEmbeddedMapModal && (
        <div className="embedded-map-modal modal modal-open z-9999">
          <div
            className="modal-box max-w-97-5 max-h-19/20 h-19/20 p-0 overflow-hidden"
            style={{ border: "0.25rem solid var(--primary)" }}
          >
            <SearchResultContainer
              mapBoxToken={snapshotResponse.mapboxToken}
              mapBoxMapId={
                snapshotResponse.config?.mapBoxMapId ||
                searchContextState.responseConfig?.mapBoxMapId
              }
              searchResponse={searchContextState.searchResponse!}
              placesLocation={searchContextState.placesLocation}
              location={searchContextState.location!}
              isTrial={
                user?.subscription?.type === ApiSubscriptionPlanType.TRIAL
              }
              editorMode={true}
              user={user}
              userPoiIcons={user?.poiIcons}
            />
            <img
              src={closeIcon}
              alt="close"
              className="absolute right-5 top-1 h-10 w-10 z-1000 cursor-pointer"
              style={{
                background: "var(--primary)",
                borderLeft: "2px solid transparent",
                borderRight: "2px solid transparent",
                borderRadius: "50%",
              }}
              onClick={() => {
                setIsShownEmbeddedMapModal(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ExpressAnalysisModal;
