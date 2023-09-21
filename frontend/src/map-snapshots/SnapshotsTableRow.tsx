import { FunctionComponent, ReactNode, useContext } from "react";
import { useHistory } from "react-router-dom";
import copy from "copy-to-clipboard";
import dayjs from "dayjs";

import { UserActionTypes, UserContext } from "context/UserContext";
import { toastError, toastSuccess } from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import FormModal, { ModalConfig } from "../components/FormModal";
import IncreaseLimitFormHandler from "../user/IncreaseLimitFormHandler";
import { ApiSubscriptionLimitsEnum } from "../../../shared/types/subscription-plan";
import { LimitIncreaseModelNameEnum } from "../../../shared/types/billing";
import { useTools } from "../hooks/tools";
import { snapshotEditorPath } from "../shared/shared.constants";
import { useLocationData } from "../hooks/locationdata";

interface ISnapshotsTableRowProps {
  snapshot: ApiSearchResultSnapshotResponse;
  openCodeSnippetModal: (snapshot: ApiSearchResultSnapshotResponse) => void;
  templateSnapshotId?: string;
}

const SnapshotsTableRow: FunctionComponent<ISnapshotsTableRowProps> = ({
  snapshot,
  openCodeSnippetModal,
  templateSnapshotId,
}) => {
  const { userDispatch } = useContext(UserContext);

  const history = useHistory();
  const { deleteSnapshot } = useLocationData();
  const { createDirectLink, updateUserSettings } = useTools();

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);

    if (success) {
      toastSuccess("Erfolgreich in Zwischenablage kopiert!");
    }
  };

  const handleSnapshotDelete = async (snapshotId: string): Promise<void> => {
    try {
      const confirmDeleteRequest = window.confirm(
        "Wollen Sie wirklich das Kartensnippet löschen?"
      );

      if (confirmDeleteRequest) {
        await deleteSnapshot(snapshotId);

        userDispatch({
          type: UserActionTypes.REMOVE_EMBEDDABLE_MAP,
          payload: snapshotId,
        });
      }
    } catch (err) {
      toastError("Fehler beim Löschen eines Snippets");
      console.error(err);
    }
  };

  const updateTemplateSnapshotId = async (
    updatedTemplateId: string | null
  ): Promise<void> => {
    await updateUserSettings({ templateSnapshotId: updatedTemplateId });

    userDispatch({
      type: UserActionTypes.SET_TEMPLATE_SNAPSHOT_ID,
      payload: updatedTemplateId || undefined,
    });

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
          history.push(`${snapshotEditorPath}/${embeddableMap.id}`);
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
    <tr
      key={`embeddable-map-${snapshot.token}`}
      className="cursor-pointer"
      onClick={() => {
        openCodeSnippetModal(snapshot);
      }}
    >
      <th style={{ whiteSpace: "normal" }}>
        {snapshot?.snapshot?.placesLocation?.label}
      </th>
      <td style={{ whiteSpace: "normal" }}>{snapshot.description}</td>
      <td>{new Date(snapshot.createdAt).toLocaleDateString("de-DE")}</td>
      <td>
        {snapshot.lastAccess
          ? `${new Date(snapshot.lastAccess).toLocaleDateString(
              "de-DE"
            )} ${new Date(snapshot.lastAccess).toLocaleTimeString("de-DE")}`
          : "Kein Aufruf"}
      </td>
      <td>{snapshot.visitAmount || "Keine Besuche"}</td>
      <td>
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr 2fr 1fr" }}
        >
          {!snapshot.endsAt || dayjs().isBefore(snapshot.endsAt) ? (
            <OpenMapEditorButton embeddableMap={snapshot} />
          ) : (
            <IncreaseLimitModal modelId={snapshot.id} />
          )}
          <button
            className="ml-5 rounded btn-xs btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              copyCodeToClipBoard(createDirectLink(snapshot.token));
            }}
          >
            Link Kopieren
          </button>
          {snapshot.id === templateSnapshotId ? (
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
                void updateTemplateSnapshotId(snapshot.id);
              }}
            >
              Als Vorlage festlegen
            </button>
          )}
          <button
            className="ml-5 rounded btn-xs btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              void handleSnapshotDelete(snapshot.id);
            }}
          >
            Löschen
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SnapshotsTableRow;
