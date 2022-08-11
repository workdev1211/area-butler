import { FunctionComponent, useState } from "react";
import { useHistory } from "react-router-dom";

import "./CsvImportModal.scss";
import CloseCross from "../assets/icons/cross.svg";
import { useHttp } from "../hooks/http";
import { ApiExampleFileTypeEnum } from "../../../shared/types/real-estate";
import { AxiosResponse } from "axios";
import BusyModal from "../components/BusyModal";
import { toastError } from "../shared/shared.functions";

interface ICsvImportModalProps {
  closeModal: () => void;
}

const CsvImportModal: FunctionComponent<ICsvImportModalProps> = ({
  closeModal,
}) => {
  const { get, post } = useHttp();
  const history = useHistory();

  const [isShownBusyModal, setIsShownBusyModal] = useState(false);

  const downloadFile = async (
    fileType: ApiExampleFileTypeEnum
  ): Promise<void> => {
    const response: AxiosResponse<Blob> = await get(
      `/api/real-estate-listings/examples/${fileType}`,
      {},
      { responseType: "arraybuffer" }
    );

    const fileName = response.headers["content-disposition"]
      .split("filename=")[1]
      .replace(/"/g, "");

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(new Blob([response.data]));
    link.setAttribute("download", `${fileName}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const uploadCsvFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setIsShownBusyModal(true);

    try {
      const { data: errorLineNumbers } = await post<number[]>(
        "/api/real-estate-listings/upload",
        formData,
        {
          "Content-Type": "multipart/form-data",
        }
      );

      if (errorLineNumbers.length > 0) {
        setIsShownBusyModal(false);
        closeModal();
        toastError(
          `Beim Importieren von Daten aus den folgenden Zeilen sind Fehler aufgetreten: ${errorLineNumbers}`,
          () => {
            history.go(0);
          },
          5000
        );
      } else {
        history.go(0);
      }
    } catch (e) {
      setIsShownBusyModal(false);
      closeModal();

      toastError(
        "Der CSV-Import ist fehlgeschlagen. Bitte überprüfen Sie die Dateistruktur."
      );
    }
  };

  return (
    <>
      {isShownBusyModal && (
        <BusyModal
          items={[{ key: "csv-import", text: "CSV-Datei wird importiert" }]}
          isDisabledLoadingBar={true}
          isAnimated={true}
        />
      )}
      <div className="csv-import modal modal-open z-9999">
        <div className="modal-box">
          <div className="modal-header">
            <span>Import aus CSV-Datei</span>
            <img
              src={CloseCross}
              alt="close"
              onClick={() => {
                closeModal();
              }}
            />
          </div>
          <div className="modal-content">
            Bitte bereiten Sie die CSV-Dateistruktur gemäß den bereitgestellten
            Beispielen vor. Alle Spalten sollten sich an den angegebenen Stellen
            befinden. Die erste Reihe Zeile entfällt. Adresse ist ein
            Pflichtfeld.
          </div>
          <div className="modal-action">
            <button
              className="btn btn-sm btn-default"
              onClick={async () => {
                await downloadFile(ApiExampleFileTypeEnum.XLS);
              }}
            >
              XLS-Datei
            </button>
            <button
              className="btn btn-sm btn-default"
              onClick={async () => {
                await downloadFile(ApiExampleFileTypeEnum.CSV);
              }}
            >
              CSV-Datei
            </button>
            <div>
              <label
                htmlFor="file"
                style={{ cursor: "pointer" }}
                className="btn btn-primary"
              >
                Importieren
              </label>
              <input
                type="file"
                id="file"
                accept=".csv"
                style={{ display: "none" }}
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
    </>
  );
};

export default CsvImportModal;
