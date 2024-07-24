import { FC, useContext, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import CodeSnippetModal from "components/CodeSnippetModal";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";
import { useTools } from "../hooks/tools";
import SnapshotsTableRow from "./SnapshotsTableRow";
import { SearchContext } from "../context/SearchContext";

interface IEmbeddableMapsTableProps {
  embeddableMaps: ApiSearchResultSnapshotResponse[];
}

const EmbeddableMapsTable: FC<IEmbeddableMapsTableProps> = ({
  embeddableMaps,
}) => {
  const { t } = useTranslation();
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
    const tokenDataParams = {
      isAddressShown: snapshot.config?.showAddress,
      tokens: {
        addressToken: snapshot.addressToken,
        unaddressToken: snapshot.unaddressToken,
        token: snapshot.token,
      },
    };
    const directionLink = createDirectLink(tokenDataParams);
    const codeSnippet = createCodeSnippet(tokenDataParams);

    setCodeSnippet(codeSnippet);
    setDirectLink(directionLink);
    setSnapshot(snapshot);
    setIsShownModal(true);
  };

  let curEstSnapshots: ApiSearchResultSnapshotResponse[] = [];
  let otherSnapshots: ApiSearchResultSnapshotResponse[] = [];

  if (isIntegrationUser) {
    embeddableMaps.forEach((snapshotRes) => {
      if (snapshotRes.realEstateId === realEstateListing?.id) {
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
            <th>{t(IntlKeys.common.address)}</th>
            <th>{t(IntlKeys.realEstate.note)}</th>
            <th>{t(IntlKeys.realEstate.createdOn)}</th>
            <th>{t(IntlKeys.realEstate.lastCall)}</th>
            <th>{t(IntlKeys.realEstate.numberOfVisits)}</th>
            <th>{t(IntlKeys.realEstate.addressDisplayed)}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {curEstSnapshots.map((snapshot) => (
            <SnapshotsTableRow
              key={`embeddable-map-${snapshot.id}`}
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
              key={`embeddable-map-${snapshot.id}`}
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
