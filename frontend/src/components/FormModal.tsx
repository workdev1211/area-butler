import {
  FunctionComponent,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
  cloneElement,
  MouseEvent,
} from "react";
import { v4 as uuid } from "uuid";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

export interface ModalConfig {
  buttonTitle?: string;
  buttonClass?: string;
  submitButtonTitle?: string;
  modalTitle: string | ReactNode;
  modalButton?: ReactNode;
  modalOpen?: boolean;
  postSubmit?: (success: boolean) => void;
  onClose?: () => void;
}

export interface FormModalData {
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
  onClose?: () => void;
}

export const FormModal: FunctionComponent<{
  modalConfig: ModalConfig;
}> = (props) => {
  const { t } = useTranslation();
  const { modalConfig } = props;

  const [modalOpen, setModalOpen] = useState(modalConfig.modalOpen);
  const [busy, setBusy] = useState(false);

  const formId = `form-${uuid()}`;

  useEffect(() => {
    if (!!modalConfig.modalOpen) {
      setModalOpen(modalConfig.modalOpen);
    }
  }, [modalConfig.modalOpen, setModalOpen]);

  const beforeSubmit = () => {
    setBusy(true);
  };

  const postSubmit = (success: boolean) => {
    setBusy(false);
    success && setModalOpen(!modalOpen);
  };

  const onClose = () => {
    modalConfig.onClose && modalConfig.onClose();
  };

  return (
    <>
      {modalConfig.modalButton ? (
        cloneElement(
          modalConfig.modalButton as ReactElement<
            any,
            string | JSXElementConstructor<any>
          >,
          {
            onClick: (e: MouseEvent<HTMLButtonElement>) => {
              setModalOpen(!modalOpen);
              e.stopPropagation();
            },
          }
        )
      ) : modalConfig.buttonTitle ? (
        <button
          type="button"
          onClick={(e) => {
            setModalOpen(!modalOpen);
            e.stopPropagation();
          }}
          className={modalConfig.buttonClass || "btn btn-primary"}
        >
          {modalConfig.buttonTitle}
        </button>
      ) : null}
      {modalOpen && (
        <div id="my-modal" className="modal modal-open z-2000">
          <div className="modal-box max-h-screen overflow-y-auto">
            <h1 className="text-xl mb-5 flex items-center gap-2">
              {modalConfig.modalTitle}
            </h1>
            {cloneElement(
              props.children as ReactElement<
                any,
                string | JSXElementConstructor<any>
              >,
              {
                formId,
                beforeSubmit,
                postSubmit,
                onClose,
              }
            )}
            <div className="modal-action">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(false);
                  modalConfig.postSubmit && modalConfig.postSubmit(false);
                  modalConfig.onClose && modalConfig.onClose();
                }}
                className="btn btn-sm"
              >
                {t(IntlKeys.common.close)}
              </button>
              <button
                form={formId}
                key="submit"
                type="submit"
                disabled={busy}
                onClick={(e) => {
                  modalConfig.postSubmit && modalConfig.postSubmit(true);
                  e.stopPropagation();
                }}
                className={
                  busy
                    ? "loading btn btn-primary btn-sm"
                    : "btn btn-primary btn-sm"
                }
                autoFocus={true}
              >
                {props.modalConfig.submitButtonTitle || "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
