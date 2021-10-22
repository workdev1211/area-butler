import React, {JSXElementConstructor, ReactElement, useEffect, useState} from "react";
import {v4 as uuid} from 'uuid';

export interface ModalConfig {
    buttonTitle?: string;
    buttonStyle?: string;
    submitButtonTitle?: string;
    modalTitle: string;
    modalButton?: React.ReactNode;
    modalOpen?: boolean;
    postSubmit?: (success: boolean) => void;
}

export interface FormModalData {
    formId?: string;
    beforeSubmit?: () => void;
    postSubmit?: (success: boolean) => void;
}

export const FormModal: React.FunctionComponent<{ modalConfig: ModalConfig }> = (props) => {
    const {modalConfig} = props;

    const [modalOpen, setModalOpen] = useState(modalConfig.modalOpen);
    const [busy, setBusy] = useState(false);

    const formId = `form-${uuid()}`;

    useEffect(() => {
        if(!!modalConfig.modalOpen) {
            setModalOpen(modalConfig.modalOpen);
        }
    }, [modalConfig.modalOpen, setModalOpen]);

    const beforeSubmit = () => setBusy(true);

    const postSubmit = (success: boolean) => {
        setBusy(false);
        success && setModalOpen(!modalOpen);
    }

    return (
        <>
            {modalConfig.modalButton ? React.cloneElement(modalConfig.modalButton as ReactElement<any, string | JSXElementConstructor<any>>, {onClick: () => setModalOpen(!modalOpen)})
                : modalConfig.buttonTitle ? <button type="button" onClick={() => setModalOpen(!modalOpen)}
                          className={modalConfig.buttonStyle || 'btn btn-primary'}>
                    {modalConfig.buttonTitle}
                </button> : null}
            {modalOpen && <div id="my-modal" className='modal modal-open'>
                <div className="modal-box max-h-screen overflow-y-auto">
                    <h1 className="text-xl mb-5">{modalConfig.modalTitle}</h1>
                    {React.cloneElement(props.children as ReactElement<any, string | JSXElementConstructor<any>>, {
                        formId,
                        beforeSubmit,
                        postSubmit
                    })}
                    <div className="modal-action">
                        <button type="button" onClick={() => { setModalOpen(false); modalConfig.postSubmit && modalConfig.postSubmit(false)}} className="btn btn-sm">
                            Schließen
                        </button>
                        <button
                            form={formId}
                            key="submit"
                            type="submit"
                            disabled={busy}
                            className={busy ? 'loading btn btn-primary btn-sm' : 'btn btn-primary btn-sm'}
                        >
                            {props.modalConfig.submitButtonTitle || 'Speichern'}
                        </button>
                    </div>
                </div>
            </div>}
        </>
    );
};

export default FormModal;
