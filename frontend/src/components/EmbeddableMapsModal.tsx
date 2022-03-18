import EmbeddableMapsTable from "user/EmbeddableMapsTable";
import { ApiSearchResultSnapshotResponse } from "../../../shared/types/types";

export interface EmbeddableMapsModalProps {
  embeddableMaps: ApiSearchResultSnapshotResponse[];
  setShowModal: (show: boolean) => void;
  showModal: boolean;
}

const EmbeddableMapsModal: React.FunctionComponent<
  EmbeddableMapsModalProps
> = ({ showModal, setShowModal, embeddableMaps }) => {
  if (!showModal) {
    return null;
  }
  return (
    <div className="modal modal-open z-9999">
      <div className="modal-box max-w-max">

        <h1 className="mb-5">Verknüpfte Kartensnippets</h1>
        <EmbeddableMapsTable
          embeddableMaps={embeddableMaps}
        ></EmbeddableMapsTable>
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
