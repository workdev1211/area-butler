import React, { JSXElementConstructor, ReactElement } from "react";
import { useState } from "react";
import { v4 as uuid } from 'uuid';

export interface ModalConfig {
  buttonTitle: string;
  buttonStyle?: string;
  modalTitle: string;
}

export interface FormModalData {
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

export const FormModal: React.FunctionComponent<{ modalConfig: ModalConfig }> = (props) => {
  const {modalConfig} = props;

  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  
  const formId = `form-${uuid()}`;

  const beforeSubmit = () => setBusy(true);

  const postSubmit = (success: boolean) =>  {
    setBusy(false);
    success && setModalOpen(!modalOpen);
  }

  return (
    <>
      <button type="button" onClick={()=>setModalOpen(!modalOpen)} className={modalConfig.buttonStyle || 'btn btn-primary'}>
        {modalConfig.buttonTitle}
      </button>
      {modalOpen && <div id="my-modal" className='modal modal-open'>
        <div className="modal-box h-screen overflow-y-auto">
          <h1>{modalConfig.modalTitle}</h1>
          {React.cloneElement(props.children as ReactElement<any, string | JSXElementConstructor<any>>, {formId, beforeSubmit, postSubmit})}
          <div className="modal-action">
            <button type="button" onClick={()=>setModalOpen(!modalOpen)} className="btn btn-sm">
              Schließen
            </button>
            <button
                form={formId}
                key="submit"
                type="submit"
                disabled={busy}
                className={busy ? 'loading btn btn-primary btn-sm' : 'btn btn-primary btn-sm'}
              >
                Speichern
              </button>
          </div>
        </div>
      </div>}
    </>
  );
};

export default FormModal;
