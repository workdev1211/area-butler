import CodeSnippetModal from "components/CodeSnippetModal";
import copy from "copy-to-clipboard";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { createCodeSnippet, toastSuccess } from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";

export interface EmbeddableMapsTableProps {
  embeddableMaps: ApiSearchResultSnapshotResponse[];
}

const EmbeddableMapsTable: React.FunctionComponent<EmbeddableMapsTableProps> =
  ({ embeddableMaps }) => {
    const [showModal, setShowModal] = useState(false);
    const [codeSnippet, setCodeSnippet] = useState("");
    const history = useHistory();

    const copyCodeToClipBoard = (codeSnippet: string) => {
      const success = copy(codeSnippet);
      if (success) {
        toastSuccess("Karten Snippet erfolgreich kopiert!");
      }
    };

    const openCodeSnippetModal = (token: string) => {
      setCodeSnippet(createCodeSnippet(token));
      setShowModal(true);
    };

    return (
      <div className="overflow-x-auto">
        <CodeSnippetModal showModal={showModal} setShowModal={setShowModal} codeSnippet={codeSnippet} />
        <table className="table w-full table-compact">
          <thead>
            <tr>
              <th>Adresse</th>
              <th>Erstellt am</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {embeddableMaps
              .sort(
                (e1, e2) =>
                  new Date(e2.createdAt).getTime() -
                  new Date(e1.createdAt).getTime()
              )
              .map((embeddableMap) => (
                <tr
                  key={`embeddable-map-${embeddableMap.token}`}
                  className="cursor-pointer"
                  onClick={() => openCodeSnippetModal(embeddableMap.token)}
                >
                  <th>{embeddableMap?.snapshot?.placesLocation?.label}</th>
                  <td>
                    {new Date(embeddableMap.createdAt).toLocaleDateString(
                      "de-DE"
                    )}
                  </td>
                  <td>
                  <button
                      className="ml-5 rounded btn-xs btn-primary"
                      onClick={(e) => {
                        history.push(`snippet-editor/${embeddableMap.id}`)
                        e.stopPropagation();
                      }}
                    >
                      Bearbeiten
                    </button>
                    <button
                      className="ml-5 rounded btn-xs btn-primary"
                      onClick={(e) => {
                        copyCodeToClipBoard(
                          createCodeSnippet(embeddableMap.token)
                        );
                        e.stopPropagation();
                      }}
                    >
                      Snippet Kopieren
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
