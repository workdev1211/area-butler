import { FunctionComponent, useContext, useState } from "react";

import CodeSnippetModal from "components/CodeSnippetModal";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import { useTools } from "../hooks/tools";
import SnapshotsTableRow from "./SnapshotsTableRow";
import { SearchContext } from "../context/SearchContext";

interface IEmbeddableMapsTableProps {
  embeddableMaps: ApiSearchResultSnapshotResponse[];
}

const EmbeddableMapsTable: FunctionComponent<IEmbeddableMapsTableProps> = ({
  embeddableMaps,
}) => {
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { createDirectLink, createCodeSnippet, getActualUser } = useTools();

  const user = getActualUser();
  const isIntegrationUser = "integrationUserId" in user;
  const templateSnapshotId = isIntegrationUser
    ? user.config.templateSnapshotId
    : user.templateSnapshotId;

  const [isShownModal, setIsShownModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [directLink, setDirectLink] = useState("");
  const [snapshot, setSnapshot] = useState<ApiSearchResultSnapshotResponse>();

  const openCodeSnippetModal = (
    snapshot: ApiSearchResultSnapshotResponse
  ): void => {
    setCodeSnippet(createCodeSnippet(snapshot.token));
    setDirectLink(createDirectLink(snapshot.token));
    setSnapshot(snapshot);
    setIsShownModal(true);
  };

  let curEstSnapshots: ApiSearchResultSnapshotResponse[] = [];
  let otherSnapshots: ApiSearchResultSnapshotResponse[] = [];

  if (isIntegrationUser) {
    embeddableMaps.forEach((snapshotRes) => {
      if (snapshotRes.integrationId === realEstateListing?.integrationId) {
        curEstSnapshots.push(snapshotRes);
      } else {
        otherSnapshots.push(snapshotRes);
      }
    });
  } else {
    otherSnapshots = embeddableMaps;
  }

  return (
    // TODO data tour
    <div className="overflow-x-auto" data-tour="map-snapshot-table">
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
            <th>Adresse angezeigt</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {curEstSnapshots.map((snapshot) => (
            <SnapshotsTableRow
              key={`embeddable-map-${snapshot.token}`}
              snapshot={snapshot}
              openCodeSnippetModal={openCodeSnippetModal}
              templateSnapshotId={templateSnapshotId}
            />
          ))}
          {isIntegrationUser &&
            curEstSnapshots.length > 0 &&
            otherSnapshots.length > 0 && (
              <tr className="cursor-none">
                <td colSpan={7}>
                  <div className="divider my-0" />
                </td>
              </tr>
            )}
          {otherSnapshots.map((snapshot) => (
            <SnapshotsTableRow
              key={`embeddable-map-${snapshot.token}`}
              snapshot={snapshot}
              openCodeSnippetModal={openCodeSnippetModal}
              templateSnapshotId={templateSnapshotId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmbeddableMapsTable;
