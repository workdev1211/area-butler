import copy from "copy-to-clipboard";
import { useState } from "react";
import { toastSuccess } from "shared/shared.functions";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";

export interface EmbeddableMapsTableProps {
  embeddableMaps: ApiSearchResultSnapshotResponse[];
}

const createCodeSnippet = (token: string) => {
  return `  
<iframe
  width="100%"
  height="100%"
  src="${window.location.origin}/embed?token=${token}"
  title="Area Butler Map Snippet"
></iframe>
  `;
};

const EmbeddableMapsTable: React.FunctionComponent<EmbeddableMapsTableProps> =
  ({ embeddableMaps }) => {
    const [showModal, setShowModal] = useState(false);
    const [codeSnippet, setCodeSnippet] = useState("");

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

    const CodeSnippetModal: React.FunctionComponent = () => (
      <div className="modal modal-open">
        <div className="modal-box">
          Ihr Karten-Snippet
          <div className="my-2">
            <code className="break-all text-sm">{codeSnippet}</code>
          </div>
          <div className="modal-action">
          <button
              className="btn btn-sm btn-primary"
              onClick={() => copyCodeToClipBoard(codeSnippet)}
            >
              Kopieren
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowModal(false)}
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="overflow-x-auto">
        {showModal && <CodeSnippetModal />}
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
                  <th>{embeddableMap.snapshot.placesLocation.label}</th>
                  <td>
                    {new Date(embeddableMap.createdAt).toLocaleDateString(
                      "de-DE"
                    )}
                  </td>
                  <td>
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
