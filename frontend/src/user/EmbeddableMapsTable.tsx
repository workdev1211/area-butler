import CodeSnippetModal from "components/CodeSnippetModal";
import { UserActionTypes, UserContext } from "context/UserContext";
import copy from "copy-to-clipboard";
import { useHttp } from "hooks/http";
import { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  createCodeSnippet,
  toastError,
  toastSuccess,
} from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";

export interface EmbeddableMapsTableProps {
  embeddableMaps: ApiSearchResultSnapshotResponse[];
}

const sortByLastAccessDesc = (
  e1: ApiSearchResultSnapshotResponse,
  e2: ApiSearchResultSnapshotResponse
) => {
  const e1LastAccess = !!e1.lastAccess
    ? new Date(e1.lastAccess).toISOString()
    : "";
  const e2LastAccess = !!e2.lastAccess
    ? new Date(e2.lastAccess).toISOString()
    : "";

  return e2LastAccess.localeCompare(e1LastAccess);
};

const EmbeddableMapsTable: React.FunctionComponent<
  EmbeddableMapsTableProps
> = ({ embeddableMaps }) => {
  const [showModal, setShowModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshotResponse>();
  const { deleteRequest } = useHttp();
  const {userDispatch} = useContext(UserContext);
  const history = useHistory();

  const copyCodeToClipBoard = (codeSnippet: string) => {
    const success = copy(codeSnippet);
    if (success) {
      toastSuccess("Karten Snippet erfolgreich kopiert!");
    }
  };

  const openCodeSnippetModal = (snapshot: ApiSearchResultSnapshotResponse) => {
    setCodeSnippet(createCodeSnippet(snapshot.token));
    setSnapshot(snapshot);
    setShowModal(true);
  };

  const deleteSnippet = async (id: string) => {
    try {
      const confirmDeleteRequest = window.confirm('Wollen Sie wirklich das Kartensnippet löschen?');
      if (!!confirmDeleteRequest) {
        await deleteRequest(`/api/location/snapshot/${id}`);
        userDispatch({type: UserActionTypes.REMOVE_EMBEDDABLE_MAP, payload: id});
      }
    } catch (err) {
      toastError("Fehler beim Löschen eines Snippets");
      console.error(err);
    }
  };

  return (
    <div className="overflow-x-auto">
      {showModal && <CodeSnippetModal
        showModal={showModal}
        setShowModal={setShowModal}
        codeSnippet={codeSnippet}
        editDescription={true}
        snapshot={snapshot}
      />}
      <table className="table w-full table-compact">
        <thead>
          <tr>
            <th>Adresse</th>
            <th>Notiz</th>
            <th>Erstellt am</th>
            <th>Letzter Aufruf</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {embeddableMaps.sort(sortByLastAccessDesc).map((embeddableMap) => (
            <tr
              key={`embeddable-map-${embeddableMap.token}`}
              className="cursor-pointer"
              onClick={() => openCodeSnippetModal(embeddableMap)}
            >
              <th>{embeddableMap?.snapshot?.placesLocation?.label}</th>
              <td>
                {embeddableMap.description}
              </td>
              <td>
                {new Date(embeddableMap.createdAt).toLocaleDateString("de-DE")}
              </td>
              <td>
                {embeddableMap.lastAccess
                  ? new Date(embeddableMap.lastAccess).toLocaleDateString(
                      "de-DE"
                    ) +
                    " " +
                    new Date(embeddableMap.lastAccess).toLocaleTimeString(
                      "de-DE"
                    )
                  : "Kein Aufruf"}
              </td>
              <td>
                <button
                  className="ml-5 rounded btn-xs btn-primary"
                  onClick={(e) => {
                    history.push(`snippet-editor/${embeddableMap.id}`);
                    e.stopPropagation();
                  }}
                >
                  Editor öffnen
                </button>
                <button
                  className="ml-5 rounded btn-xs btn-primary"
                  onClick={(e) => {
                    copyCodeToClipBoard(createCodeSnippet(embeddableMap.token));
                    e.stopPropagation();
                  }}
                >
                  Snippet Kopieren
                </button>
                <button
                  className="ml-5 rounded btn-xs btn-primary"
                  onClick={(e) => {
                    deleteSnippet(embeddableMap.id);
                    e.stopPropagation();
                  }}
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmbeddableMapsTable;
