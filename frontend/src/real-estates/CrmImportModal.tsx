import { FunctionComponent, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import { useHttp } from "../hooks/http";
import { ApiRealEstateExtSourcesEnum } from "../../../shared/types/real-estate";
import BusyModal from "../components/BusyModal";
import { toastError, toastSuccess } from "../shared/shared.functions";
import closeIcon from "../assets/icons/cross.svg";
import { apiConnectTypeNames } from "../../../shared/constants/real-estate";
import { useRealEstateData } from "../hooks/realestatedata";
import { TApiUserExtConnections } from "../../../shared/types/types";

interface ICrmImportModalProps {
  externalConnections: TApiUserExtConnections;
  closeModal: () => void;
}

const CrmImportModal: FunctionComponent<ICrmImportModalProps> = ({
  externalConnections,
  closeModal,
}) => {
  const { t } = useTranslation();
  const { get } = useHttp();
  const { fetchRealEstates } = useRealEstateData();

  const [isShownBusyModal, setIsShownBusyModal] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isShownBusyModal && (
        <BusyModal
          items={[
            { key: "crm-import", text: t(IntlKeys.realEstate.crmImported) },
          ]}
        />
      )}
      <div
        className={`modal ${
          isShownBusyModal ? "" : "modal-open"
        } z-1000 backdrop-blur-sm`}
      >
        <div className="modal-box px-6 py-3 sm:rounded-2xl flex flex-col gap-3">
          <div className="flex justify-end">
            <img
              className="cursor-pointer"
              src={closeIcon}
              alt="close"
              onClick={closeModal}
              style={{ color: "var(--primary)" }}
            />
          </div>
          {Object.keys(externalConnections).map((connectType) => (
            <button
              key={connectType}
              className="btn btn-xs btn-primary"
              onClick={async () => {
                setIsShownBusyModal(true);

                try {
                  const errorIds = (
                    await get<string[]>(
                      `/api/real-estate-listing/crm-import/${connectType}`
                    )
                  ).data;

                  await fetchRealEstates({ isForceFetch: true });

                  if (errorIds.length) {
                    const errorIdsText = `${t(
                      IntlKeys.realEstate.crmImportSuccess
                    )} ${
                      apiConnectTypeNames[
                        connectType as ApiRealEstateExtSourcesEnum
                      ]
                    }-IDs: ${errorIds.join(", ")}.`;

                    toastSuccess(errorIdsText);
                    console.error(errorIdsText);
                  } else {
                    toastSuccess(t(IntlKeys.common.dataImported));
                  }
                } catch (e) {
                  console.error(e);
                  toastError(t(IntlKeys.common.errorOccurred));
                }

                setIsShownBusyModal(false);
                closeModal();
              }}
            >
              {apiConnectTypeNames[connectType as ApiRealEstateExtSourcesEnum]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CrmImportModal;
