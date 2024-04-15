// TODO REMOVE IN THE FUTURE

import { FunctionComponent } from "react";

import FormModal, { ModalConfig } from "./FormModal";
import OpenAiLocationFormHandler from "../map-snapshots/OpenAiLocationFormHandler";

interface IOpenAiLocationDescriptionModalProps {
  isShownModal: boolean;
  closeModal: () => void;
  snapshotId: string;
}

const OpenAiLocationDescriptionModal: FunctionComponent<
  IOpenAiLocationDescriptionModalProps
> = ({ isShownModal, closeModal, snapshotId }) => {
  const openAiLocationModalConfig: ModalConfig = {
    modalTitle: (
      <>
        <span>Standortbeschreibung generieren</span>
        <span className="badge badge-primary">BETA</span>
      </>
    ),
    submitButtonTitle: "Generieren",
    modalOpen: isShownModal,
    postSubmit: (success) => {
      if (!success) {
        // if a user clicks on the "Schließen" button
        closeModal();
      }
    },
  };

  return (
    <FormModal modalConfig={openAiLocationModalConfig}>
      <OpenAiLocationFormHandler
        snapshotId={snapshotId}
        closeModal={() => {
          // if an error is thrown on the submit step
          closeModal();
        }}
      />
    </FormModal>
  );
};

export default OpenAiLocationDescriptionModal;
