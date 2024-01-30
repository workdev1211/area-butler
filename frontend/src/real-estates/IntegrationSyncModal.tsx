import { FunctionComponent, useEffect, useState } from "react";

import BusyModal from "../components/BusyModal";
import { toastError, toastSuccess } from "../shared/shared.functions";
import closeIcon from "../assets/icons/cross.svg";
import { useEscape } from "../hooks/escape";
import { useIntegrationSync } from "../hooks/integration/integrationsync";
import { ISelectTextValue } from "../../../shared/types/types";

interface IIntegrationSyncModalProps {
  closeModal: (isCompletedSync?: boolean) => void;
}

const allValue: ISelectTextValue = { text: "Alle", value: "all" };

const IntegrationSyncModal: FunctionComponent<IIntegrationSyncModalProps> = ({
  closeModal,
}) => {
  useEscape(closeModal);
  const { handleIntSync, fetchAvailIntStatuses } = useIntegrationSync();

  const [isShownBusyModal, setIsShownBusyModal] = useState(false);
  const [isAllowedSync, setIsAllowedSync] = useState(false);
  const [estateStatus, setEstateStatus] = useState<string | undefined>();
  const [estateStatuses, setEstateStatuses] = useState<ISelectTextValue[]>([
    allValue,
  ]);
  const [estateMarketType, setEstateMarketType] = useState<
    string | undefined
  >();
  const [estateMarketTypes, setEstateMarketTypes] = useState<
    ISelectTextValue[]
  >([allValue]);

  useEffect(() => {
    const setAvailStatuses = async (): Promise<void> => {
      const {
        estateStatuses: fetchedStatuses,
        estateMarketTypes: fetchedMarketTypes,
      } = await fetchAvailIntStatuses();

      if (fetchedStatuses) {
        setEstateStatuses([...estateStatuses, ...fetchedStatuses]);
      }

      if (fetchedMarketTypes) {
        setEstateMarketTypes([...estateMarketTypes, ...fetchedMarketTypes]);
      }

      setIsAllowedSync(true);
    };

    void setAvailStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncRealEstates = async (): Promise<void> => {
    setIsShownBusyModal(true);
    let isCompletedSync = false;

    try {
      const errorLineNumbers = await handleIntSync({
        estateStatus,
        estateMarketType,
      });

      if (errorLineNumbers.length) {
        console.error(errorLineNumbers);

        toastError(
          `Beim Importieren von Eigenschaften mit den folgenden IDs sind Fehler aufgetreten: ${errorLineNumbers
            .sort((a, b) => a.localeCompare(b))
            .join(", ")}`,
          () => {},
          false
        );
      }

      if (!errorLineNumbers.length) {
        toastSuccess("Immobiliensynchronisierung erfolgreich abgeschlossen!");
      }

      isCompletedSync = true;
    } catch (e) {
      console.error(e);
      toastError("Immobiliensynchronisation fehlgeschlagen!");
    } finally {
      closeModal(isCompletedSync);
      setIsShownBusyModal(false);
    }
  };

  return (
    <>
      {isShownBusyModal && (
        <BusyModal
          items={[
            { key: "sync-estates", text: "Immobilien werden synchronisiert" },
          ]}
          isDisabledLoadingBar={true}
          isAnimated={true}
        />
      )}

      <div
        className={`modal ${
          isShownBusyModal ? "" : "modal-open"
        } z-1000 backdrop-blur-sm`}
      >
        <div className="modal-box p-0 sm:rounded-2xl">
          <div className="flex justify-between px-6 py-3 rounded-t-2xl text-white bg-primary">
            <span className="text-lg font-medium">Filter setzen:</span>

            <img
              className="cursor-pointer invert"
              src={closeIcon}
              alt="close"
              onClick={() => {
                closeModal();
              }}
            />
          </div>

          <div className="px-6 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label htmlFor="estateStatuses" className="label">
                  <span>Status</span>
                </label>

                <select
                  name="estateStatuses"
                  className="select select-bordered"
                  value={estateStatus}
                  onChange={({ target: { value } }) => {
                    setEstateStatus(
                      value === allValue.value ? undefined : value
                    );
                  }}
                >
                  {estateStatuses.map(({ text, value }) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label htmlFor="marketTypes" className="label">
                  <span>Vermarktungsart</span>
                </label>

                <select
                  name="marketTypes"
                  className="select select-bordered"
                  value={estateMarketType}
                  onChange={({ target: { value } }) => {
                    setEstateMarketType(
                      value === allValue.value ? undefined : value
                    );
                  }}
                >
                  {estateMarketTypes.map(({ text, value }) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-lg btn-default"
                onClick={syncRealEstates}
                disabled={!isAllowedSync}
              >
                Sync-Immobilien
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntegrationSyncModal;
