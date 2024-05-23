import { FunctionComponent, useEffect, useState } from "react";
import { saveAs } from "file-saver";

import { useHttp } from "../hooks/http";
import { ApiExampleFileTypeEnum } from "../../../shared/types/real-estate";
import { AxiosResponse } from "axios";
import BusyModal from "../components/BusyModal";
import { toastError, toastSuccess } from "../shared/shared.functions";
import closeIcon from "../assets/icons/cross.svg";
import { CsvFileFormatEnum } from "../../../shared/types/types";

interface ICsvImportModalProps {
  closeModal: () => void;
  fileFormat?: CsvFileFormatEnum;
}

const CsvImportModal: FunctionComponent<ICsvImportModalProps> = ({
  closeModal,
  fileFormat = CsvFileFormatEnum.ON_OFFICE,
}) => {
  const { get, post } = useHttp();
  const [isShownBusyModal, setIsShownBusyModal] = useState(false);

  const downloadFile = async (
    fileType: ApiExampleFileTypeEnum
  ): Promise<void> => {
    const {
      data: responseData,
      headers: responseHeaders,
    }: AxiosResponse<Blob> = await get(
      `/api/real-estate-listing/examples?format=${fileFormat}&type=${fileType}`,
      {},
      { responseType: "arraybuffer" }
    );

    saveAs(
      new Blob([responseData]),
      responseHeaders["content-disposition"]
        .split("filename=")[1]
        .replace(/"/g, "")
    );
  };

  const uploadCsvFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setIsShownBusyModal(true);

    try {
      const { data: errorLineNumbers } = await post<number[]>(
        `/api/real-estate-listing/upload/${fileFormat}`,
        formData,
        {
          "Content-Type": "multipart/form-data",
        }
      );

      if (errorLineNumbers.length > 0) {
        toastError(
          `Beim Importieren von Daten aus den folgenden Zeilen sind Fehler aufgetreten: ${errorLineNumbers
            .sort((a, b) => a - b)
            .join(", ")}`,
          () => {},
          false
        );
      } else {
        toastSuccess("Datenimport war erfolgreich!");
      }
    } catch (e) {
      toastError(
        "Der CSV-Import ist fehlgeschlagen. Bitte überprüfen Sie die Dateistruktur."
      );
    } finally {
      closeModal();
      setIsShownBusyModal(false);
    }
  };

  useEffect(() => {
    const handleEscape = async (e: KeyboardEvent) => {
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
          items={[{ key: "csv-import", text: "CSV-Datei wird importiert" }]}
        />
      )}
      <div
        className={`modal ${
          isShownBusyModal ? "" : "modal-open"
        } z-1000 backdrop-blur-sm`}
      >
        <div className="modal-box p-0 sm:rounded-2xl">
          <div
            className="flex justify-between px-6 py-3 rounded-t-2xl text-white"
            style={{ background: "var(--primary)" }}
          >
            <span className="text-lg font-medium">Zahlungsarten</span>
            <img
              className="cursor-pointer invert"
              src={closeIcon}
              alt="close"
              onClick={closeModal}
            />
          </div>
          <div className="px-6 py-3">
            <div className="flex flex-col gap-3">
              <div className="text-justify">
                Bitte bereiten Sie die Struktur der CSV-Datei entsprechend den
                mitgelieferten Beispielen vor. In der XLS-Datei werden die
                Farben zur Erläuterung der Datenstruktur verwendet.
              </div>
              <div className="text-justify italic">
                Grüne Spalten sind obligatorisch, gelbe optional und die rote
                Spalte zeigt einen falschen Datensatz an.
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-sm btn-default"
                onClick={async () => {
                  await downloadFile(ApiExampleFileTypeEnum.XLS);
                }}
              >
                XLS-Beispiel
              </button>
              <button
                className="btn btn-sm btn-default"
                onClick={async () => {
                  await downloadFile(ApiExampleFileTypeEnum.CSV);
                }}
              >
                CSV-Beispiel
              </button>
              <div>
                <label
                  className="btn btn-primary cursor-pointer"
                  htmlFor="file"
                >
                  Importieren
                </label>
                <input
                  className="hidden"
                  type="file"
                  id="file"
                  accept=".csv"
                  onChange={async (e) => {
                    await uploadCsvFile(e.target.files![0]);
                    e.target.files = null;
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CsvImportModal;
