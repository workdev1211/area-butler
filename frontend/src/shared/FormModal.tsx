export interface ModalConfig {
  buttonTitle: string;
  buttonStyle?: string;
  modalTitle: string;
}

export const FormModal: React.FunctionComponent<{ modalConfig: ModalConfig }> = ({
  modalConfig,
  children,
}) => {
  return (
    <>
      <a href="#my-modal" className={modalConfig.buttonStyle || 'btn btn-primary'}>
        {modalConfig.buttonTitle}
      </a>
      <div id="my-modal" className="modal">
        <div className="modal-box">
          <h1>{modalConfig.modalTitle}</h1>
          <>{children}</>
          <div className="modal-action">
            <a href="#" className="btn btn-sm">
              Schließen
            </a>
            <button form="realEstateListingForm" key="submit" type="submit" className="btn btn-primary btn-sm">
              Speichern
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormModal;
