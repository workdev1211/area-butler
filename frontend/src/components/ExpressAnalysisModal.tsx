import { FunctionComponent, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import copy from "copy-to-clipboard";

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
import FormModal, { ModalConfig } from "./FormModal";
import OpenAiLocationFormHandler from "../map-snippets/OpenAiLocationFormHandler";
import { openAiFeatureAllowedEmails } from "../../../shared/constants/open-ai";
import SearchResultContainer from "./SearchResultContainer";

export interface ExpressAnalysisModalProps {
  snapshotResponse: ApiSearchResultSnapshotResponse;
  closeModal: () => void;
  isShownModal: boolean;
}

const ExpressAnalysisModal: FunctionComponent<ExpressAnalysisModalProps> = ({
  snapshotResponse,
  closeModal,
  isShownModal,
}) => {
  const { put } = useHttp();
  const history = useHistory();

  const { searchContextDispatch, searchContextState } =
    useContext(SearchContext);
  const { userDispatch, userState } = useContext(UserContext);

  const [description, setDescription] = useState(snapshotResponse?.description);
  const [isShownOpenAiLocationModal, setIsShownOpenAiLocationModal] =
    useState(false);
  const [isShownEmbeddedMapModal, setIsShownEmbeddedMapModal] = useState(false);

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const user = userState.user;

  const hasOpenAiFeature =
    openAiFeatureAllowedEmails.includes(user?.email || "") ||
    user?.subscriptionPlan?.config.appFeatures.openAi;

  const performCloseModal = async () => {
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

  // TODO move to the common component with the same modal config from SnippetEditorPage
  const openAiLocationModalConfig: ModalConfig = {
    modalTitle: "Standortbeschreibung generieren",
    submitButtonTitle: "Generieren",
    modalOpen: isShownOpenAiLocationModal,
    postSubmit: (success) => {
      if (!success) {
        // if a user clicks on the "Schließen" button
        setIsShownOpenAiLocationModal(false);
      }
    },
  };

  const OpenAiLocationModal: FunctionComponent<{}> = () => (
    <FormModal modalConfig={openAiLocationModalConfig}>
      <OpenAiLocationFormHandler
        searchResultSnapshotId={snapshotResponse.id}
        closeModal={() => {
          // if an error is thrown on the submit step
          setIsShownOpenAiLocationModal(false);
        }}
      />
    </FormModal>
  );

  if (!isShownModal) {
    return null;
  }

  // TODO think about memoizing the second subcomponent (!isShownOpenAiLocationModal)
  return (
    <>
      {isShownOpenAiLocationModal && hasOpenAiFeature && (
        <OpenAiLocationModal />
      )}
      {!isShownOpenAiLocationModal && (
        <div className="modal modal-open z-9999">
          <div className="modal-box">
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
                censusData={searchContextState.censusData!}
                exportType="CHEATSHEET"
              />
            )}
            <div className="flex flex-col modal-block">
              <h3
                className="cursor-pointer inline-flex gap-2 items-center"
                onClick={() => {
                  setIsShownEmbeddedMapModal(true);
                }}
              >
                <img
                  src={screenshotIcon}
                  alt="screenshot-icon"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                  }}
                />
                Kartenausschnitte erstellen PNG
              </h3>
              <h3
                className="cursor-pointer inline-flex gap-2 items-center"
                style={{ borderTop: "1px solid black" }}
                onClick={() => {
                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_ACTIVE,
                    payload: true,
                  });
                }}
              >
                <img
                  src={pdfIcon}
                  alt="pdf-icon"
                  style={{
                    filter: "invert(100%)",
                    width: "1.5rem",
                    height: "1.5rem",
                  }}
                />
                Umfeldanalyse PDF
              </h3>
              <h3
                className="cursor-pointer inline-flex gap-2 items-center"
                onClick={() => {
                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_DOCX_ACTIVE,
                    payload: true,
                  });
                }}
              >
                <img
                  src={pdfIcon}
                  alt="pdf-icon"
                  style={{
                    filter: "invert(100%)",
                    width: "1.5rem",
                    height: "1.5rem",
                  }}
                />
                Umfeldanalyse DOC
              </h3>
              <h3
                className="cursor-pointer inline-flex gap-2 items-center"
                onClick={() => {
                  searchContextDispatch({
                    type: SearchContextActionTypes.SET_PRINTING_CHEATSHEET_ACTIVE,
                    payload: true,
                  });
                }}
              >
                <img
                  src={pdfIcon}
                  alt="pdf-icon"
                  style={{
                    filter: "invert(100%)",
                    width: "1.5rem",
                    height: "1.5rem",
                  }}
                />
                Überblick PDF
              </h3>
              {hasOpenAiFeature && (
                <h3
                  className="cursor-pointer inline-flex gap-2 items-center"
                  style={{ borderTop: "1px solid black" }}
                  onClick={() => {
                    setIsShownOpenAiLocationModal(true);
                  }}
                >
                  <img
                    src={aiIcon}
                    alt="ai-icon"
                    style={{
                      filter: "invert(100%)",
                      width: "1.5rem",
                      height: "1.5rem",
                    }}
                  />
                  Lagetext generieren
                </h3>
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
                className="cursor-pointer inline-flex gap-2 items-center"
                onClick={() => {
                  copyCodeToClipBoard(createDirectLink(snapshotResponse.token));
                }}
              >
                <img
                  src={copyIcon}
                  alt="copy-icon"
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                  }}
                />
                Hyperlink zur Vollbild-Karte URL
              </h3>
              <h3
                className="cursor-pointer inline-flex gap-2 items-center"
                onClick={() => {
                  copyCodeToClipBoard(
                    createCodeSnippet(snapshotResponse.token)
                  );
                }}
              >
                <img
                  src={copyIcon}
                  alt="copy-icon"
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                  }}
                />
                Snippet (iFrame) HTML
              </h3>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-sm btn-default"
                onClick={async () => {
                  await performCloseModal();
                }}
              >
                Schließen
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={async () => {
                  await performCloseModal();
                  history.push(`snippet-editor/${snapshotResponse.id}`);
                }}
              >
                Editor öffnen
              </button>
            </div>
          </div>
        </div>
      )}
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
            />
            <img
              src={closeIcon}
              alt="close-icon"
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
