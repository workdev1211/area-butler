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
import FormModal, { ModalConfig } from "./FormModal";
import OpenAiLocationFormHandler from "../map-snippets/OpenAiLocationFormHandler";
import { openAiFeatureAllowedEmails } from "../../../shared/constants/exclusion";

export interface ExpressAnalysisModalProps {
  snapshotResponse: ApiSearchResultSnapshotResponse;
  setIsShownModal: (isShownModal: boolean) => void;
  isShownModal: boolean;
}

const ExpressAnalysisModal: FunctionComponent<ExpressAnalysisModalProps> = ({
  snapshotResponse,
  setIsShownModal,
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

  const closeModal = async () => {
    setIsShownModal(false);

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
            <div className="mb-3">Express-Analyseergebnisse</div>
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
            <div>
              <h3
                className="cursor-pointer inline-flex gap-2 items-center"
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
                Export Analyse PDF
              </h3>
            </div>
            <div>
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
                Export Analyse DOCX
              </h3>
            </div>
            <div>
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
                Export Überblick PDF
              </h3>
            </div>
            {hasOpenAiFeature && (
              <div>
                <h3
                  className="cursor-pointer inline-flex gap-2 items-center"
                  onClick={() => {
                    setIsShownOpenAiLocationModal(true);
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
                  Lagetext generieren
                </h3>
              </div>
            )}
            <div className="mb-2">
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
            </div>
            <div>
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
                Direkt Link
              </h3>
            </div>
            <div>
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
                HTML Snippet
              </h3>
            </div>
            <div className="modal-action">
              <button className="btn btn-sm btn-default" onClick={closeModal}>
                Schließen
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={async () => {
                  await closeModal();
                  history.push(`snippet-editor/${snapshotResponse.id}`);
                }}
              >
                Editor öffnen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpressAnalysisModal;
