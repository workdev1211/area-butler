import { FunctionComponent, useEffect, useState } from "react";

import BusyModal from "../components/BusyModal";
import { toastError, toastSuccess } from "../shared/shared.functions";
import closeIcon from "../assets/icons/cross.svg";
import { useEscape } from "../hooks/escape";
import { useOnOfficeSync } from "../on-office/hooks/sync";

interface IOnOfficeSyncModalProps {
  closeModal: (isSyncSuccessful?: boolean) => void;
}

const allValue = "Alle";

const OnOfficeSyncModal: FunctionComponent<IOnOfficeSyncModalProps> = ({
  closeModal,
}) => {
  useEscape(closeModal);
  const { handleOnOfficeSync, fetchAvailStatuses } = useOnOfficeSync();

  const [isShownBusyModal, setIsShownBusyModal] = useState(false);
  const [isAllowedSync, setIsAllowedSync] = useState(false);
  const [estateStatus, setEstateStatus] = useState<string | undefined>();
  const [estateStatuses, setEstateStatuses] = useState<string[]>([allValue]);
  const [estateMarketType, setEstateMarketType] = useState<
    string | undefined
  >();
  const [estateMarketTypes, setEstateMarketTypes] = useState<string[]>([
    allValue,
  ]);

  useEffect(() => {
    const setAvailStatuses = async (): Promise<void> => {
      const {
        estateStatuses: fetchedStatuses,
        estateMarketTypes: fetchedMarketTypes,
      } = await fetchAvailStatuses();

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
    let isSyncSuccessful = false;

    try {
      const errorLineNumbers = await handleOnOfficeSync({
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

      isSyncSuccessful = true;
    } catch (e) {
      console.error(e);
      toastError("Immobiliensynchronisation fehlgeschlagen!");
    } finally {
      closeModal(isSyncSuccessful);
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
                    setEstateStatus(value === allValue ? undefined : value);
                  }}
                >
                  {estateStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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
                    setEstateMarketType(value === allValue ? undefined : value);
                  }}
                >
                  {estateMarketTypes.map((marketType) => (
                    <option key={marketType} value={marketType}>
                      {marketType}
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

export default OnOfficeSyncModal;
