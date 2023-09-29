import { FunctionComponent } from "react";

import EmbeddableMapsTable from "map-snapshots/EmbeddableMapsTable";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";

export interface IEmbeddableMapsModalProps {
  setShowModal: (show: boolean) => void;
  embeddableMaps: ApiSearchResultSnapshotResponse[];
}

const EmbeddableMapsModal: FunctionComponent<IEmbeddableMapsModalProps> = ({
  setShowModal,
  embeddableMaps,
}) => {
  return (
    <div className="modal modal-open z-9999">
      <div className="modal-box max-w-max">
        <h1 className="mb-5">Verknüpfte Kartensnippets</h1>
        <EmbeddableMapsTable embeddableMaps={embeddableMaps} />
        <div className="modal-action">
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
};

export default EmbeddableMapsModal;
