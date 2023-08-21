import { FunctionComponent, ReactNode, useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";

import CodeSnippetModal from "components/CodeSnippetModal";
import { UserActionTypes, UserContext } from "context/UserContext";
import { useHttp } from "hooks/http";
import { toastError, toastSuccess } from "shared/shared.functions";
import {
  ApiSearchResultSnapshotResponse,
  ApiUser,
} from "../../../shared/types/types";
import FormModal, { ModalConfig } from "../components/FormModal";
import IncreaseLimitFormHandler from "../user/IncreaseLimitFormHandler";
import { ApiSubscriptionLimitsEnum } from "../../../shared/types/subscription-plan";
import { LimitIncreaseModelNameEnum } from "../../../shared/types/billing";
import { useTools } from "../hooks/tools";

interface IEmbeddableMapsTableProps {
  embeddableMaps: ApiSearchResultSnapshotResponse[];
}

const EmbeddableMapsTable: FunctionComponent<IEmbeddableMapsTableProps> = ({
  embeddableMaps,
}) => {
  const history = useHistory();
  const { deleteRequest, post } = useHttp();
  const { createDirectLink, createCodeSnippet } = useTools();
  const { userDispatch, userState } = useContext(UserContext);

  const [isShownModal, setIsShownModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshotResponse>();

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const openCodeSnippetModal = (
    snapshot: ApiSearchResultSnapshotResponse
  ): void => {
    setCodeSnippet(createCodeSnippet(snapshot.token));
    setDirectLink(createDirectLink(snapshot.token));
    setSnapshot(snapshot);
    setIsShownModal(true);
  };

  const deleteSnippet = async (id: string): Promise<void> => {
    try {
      const confirmDeleteRequest = window.confirm(
        "Wollen Sie wirklich das Kartensnippet löschen?"
      );

      if (confirmDeleteRequest) {
        await deleteRequest(`/api/location/snapshot/${id}`);

        userDispatch({
          type: UserActionTypes.REMOVE_EMBEDDABLE_MAP,
          payload: id,
        });
      }
    } catch (err) {
      toastError("Fehler beim Löschen eines Snippets");
      console.error(err);
    }
  };

  const updateTemplateSnapshotId = async (
    templateSnapshotId: string | null
  ): Promise<void> => {
    userDispatch({
      type: UserActionTypes.SET_TEMPLATE_SNAPSHOT_ID,
      payload: templateSnapshotId || undefined,
    });

    await post<ApiUser>("/api/users/me/settings", { templateSnapshotId });
    toastSuccess("Vorlage gespeichert.");
  };

  const OpenMapEditorButton: FunctionComponent<{
    embeddableMap: ApiSearchResultSnapshotResponse;
  }> = ({ embeddableMap }) => {
    return (
      <button
        className="ml-5 rounded btn-xs btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          history.push(`snippet-editor/${embeddableMap.id}`);
        }}
      >
        Editor öffnen
      </button>
    );
  };

  const increaseLimitButton: ReactNode = (
    <button type="button" className="ml-5 rounded btn-xs btn-primary">
      Editor öffnen
    </button>
  );

  const increaseLimitModalConfig: ModalConfig = {
    modalTitle: "Abfragelimit erreicht",
    buttonTitle: "Analyse starten",
    submitButtonTitle: "Neues Kontingent kaufen",
    modalButton: increaseLimitButton,
  };

  const IncreaseLimitModal: FunctionComponent<{
    modelId?: string;
  }> = ({ modelId }) => (
    <FormModal modalConfig={increaseLimitModalConfig}>
      <IncreaseLimitFormHandler
        limitType={ApiSubscriptionLimitsEnum.ADDRESS_EXPIRATION}
        modelName={LimitIncreaseModelNameEnum.SearchResultSnapshot}
        modelId={modelId}
      />
    </FormModal>
  );

  return (
    // TODO data tour
    <div className="overflow-x-auto" data-tour="real-estates-table">
      {isShownModal && (
        <CodeSnippetModal
          codeSnippet={codeSnippet}
          directLink={directLink}
          editDescription={true}
          snapshot={snapshot}
          closeModal={() => {
            setIsShownModal(false);
          }}
        />
      )}
      <table className="table w-full">
        <thead>
          <tr>
            <th>Adresse</th>
            <th>Notiz</th>
            <th>Erstellt am</th>
            <th>Letzter Aufruf</th>
            <th>Anzahl der Besuche</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {embeddableMaps.map((embeddableMap) => (
            <tr
              key={`embeddable-map-${embeddableMap.token}`}
              className="cursor-pointer"
              onClick={() => {
                openCodeSnippetModal(embeddableMap);
              }}
            >
              <th style={{ whiteSpace: "normal" }}>
                {embeddableMap?.snapshot?.placesLocation?.label}
              </th>
              <td style={{ whiteSpace: "normal" }}>
                {embeddableMap.description}
              </td>
              <td>
                {new Date(embeddableMap.createdAt).toLocaleDateString("de-DE")}
              </td>
              <td>
                {embeddableMap.lastAccess
                  ? `${new Date(embeddableMap.lastAccess).toLocaleDateString(
                      "de-DE"
                    )} ${new Date(embeddableMap.lastAccess).toLocaleTimeString(
                      "de-DE"
                    )}`
                  : "Kein Aufruf"}
              </td>
              <td>{embeddableMap.visitAmount || "Keine Besuche"}</td>
              <td>
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "1fr 1fr 2fr 1fr" }}
                >
                  {!embeddableMap.endsAt ||
                  dayjs().isBefore(embeddableMap.endsAt) ? (
                    <OpenMapEditorButton embeddableMap={embeddableMap} />
                  ) : (
                    <IncreaseLimitModal modelId={embeddableMap.id} />
                  )}
                  <button
                    className="ml-5 rounded btn-xs btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCodeToClipBoard(
                        createDirectLink(embeddableMap.token)
                      );
                    }}
                  >
                    Link Kopieren
                  </button>
                  {embeddableMap.id === userState.user?.templateSnapshotId ? (
                    <button
                      className="ml-5 rounded btn-xs btn-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        void updateTemplateSnapshotId(null);
                      }}
                    >
                      Vorlage aufheben
                    </button>
                  ) : (
                    <button
                      className="ml-5 rounded btn-xs btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        void updateTemplateSnapshotId(embeddableMap.id);
                      }}
                    >
                      Als Vorlage festlegen
                    </button>
                  )}
                  <button
                    className="ml-5 rounded btn-xs btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteSnippet(embeddableMap.id);
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmbeddableMapsTable;
