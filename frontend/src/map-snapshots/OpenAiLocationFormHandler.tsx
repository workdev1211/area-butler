// TODO REMOVE IN THE FUTURE

import { FunctionComponent, useState } from "react";
import copy from "copy-to-clipboard";

import { useHttp } from "hooks/http";
import { toastError, toastSuccess } from "shared/shared.functions";
import OpenAiLocDescForm from "../components/open-ai/OpenAiLocDescForm";
import { IApiOpenAiLocDescQuery } from "../../../shared/types/open-ai";
import copyIcon from "../assets/icons/copy.svg";

export interface IOpenAiLocationFormHandlerProps {
  snapshotId: string;
  closeModal: () => void;
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

const OpenAiLocationFormHandler: FunctionComponent<
  IOpenAiLocationFormHandlerProps
> = ({
  snapshotId,
  closeModal,
  formId,
  beforeSubmit = () => {},
  postSubmit = () => {},
}) => {
  const { post } = useHttp();
  const [locationDescription, setLocationDescription] = useState<string>();

  const generateLocationText = async ({
    meanOfTransportation,
    tonality,
    customText,
  }: Omit<IApiOpenAiLocDescQuery, "snapshotId">): Promise<void> => {
    setLocationDescription(
      (
        await post<string, IApiOpenAiLocDescQuery>(
          "/api/location/open-ai-loc-desc",
          {
            customText,
            meanOfTransportation,
            snapshotId,
            tonality,
          }
        )
      ).data
    );
  };

  const onSubmit = async (
    aiDescriptionQuery: Omit<IApiOpenAiLocDescQuery, "snapshotId">
  ): Promise<void> => {
    try {
      beforeSubmit();
      await generateLocationText(aiDescriptionQuery);
    } catch (err) {
      console.error(err);
      toastError("Der Fehler ist aufgetreten!");
      closeModal();
    } finally {
      postSubmit(false);
    }
  };

  return (
    <>
      <div className="text-justify text-sm">
        <p>
          Es kann mühselig sein, einen Text zu konstruieren, auch wenn man schon
          einen groben Plan bezüglich der Lage hat. Die richtige Struktur und
          die gut klingende Formulierungen zu finden, ist nicht leicht. Hierfür
          möchten wir Ihnen Inspiration geben. Da das Feature in der Beta-Phase
          ist, empfehlen wir, die harten Fakten vor der Weiterverwendung kurz zu
          prüfen.
        </p>
        <p>Viel Spaß mit unserem KI-Textgenerator.</p>
      </div>

      <OpenAiLocDescForm formId={formId!} onSubmit={onSubmit} />

      {locationDescription && (
        <div>
          <h3>Ihr KI-generierter Textvorschlag</h3>
          <div className="text-justify">{locationDescription}</div>
          <div
            className="inline-flex gap-2 cursor-pointer items-center mt-3"
            onClick={() => {
              const success = copy(locationDescription);

              if (success) {
                toastSuccess("Erfolgreich in Zwischenablage kopiert!");
              }
            }}
          >
            <img
              src={copyIcon}
              alt="copy-icon"
              style={{
                width: "16px",
                height: "16px",
                filter:
                  "invert(14%) sepia(66%) saturate(4788%) hue-rotate(333deg) brightness(98%) contrast(96%)",
              }}
            />
            <span className="text-sm font-bold">
              In Zwischenablage kopieren
            </span>
          </div>
          <div
            className="text-sm font-bold pt-3 mt-1.5"
            style={{ border: 0, borderTop: "1px solid black" }}
          >
            Nicht zufrieden? Mit Klick auf "Generieren" wird ein neuer Text für
            Sie erstellt!
          </div>
        </div>
      )}
    </>
  );
};

export default OpenAiLocationFormHandler;
