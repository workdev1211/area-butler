import { FunctionComponent, useState } from "react";
import copy from "copy-to-clipboard";

import { useHttp } from "hooks/http";
import { toastError, toastSuccess } from "shared/shared.functions";
import OpenAiLocationForm from "./OpenAiLocationForm";
import { IApiAiDescriptionQuery } from "../../../shared/types/open-ai";
import copyIcon from "../assets/icons/copy.svg";

export interface IOpenAiLocationFormHandlerProps {
  searchResultSnapshotId: string;
  closeModal: () => void;
  formId?: string;
  beforeSubmit?: () => void;
  postSubmit?: (success: boolean) => void;
}

const OpenAiLocationFormHandler: FunctionComponent<
  IOpenAiLocationFormHandlerProps
> = ({
  searchResultSnapshotId,
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
    textLength,
    customText,
  }: Omit<IApiAiDescriptionQuery, "searchResultSnapshotId">) => {
    setLocationDescription(
      (
        await post<string, IApiAiDescriptionQuery>(
          "/api/location/ai-description",
          {
            searchResultSnapshotId: searchResultSnapshotId,
            meanOfTransportation,
            tonality,
            textLength,
            customText,
          }
        )
      ).data
    );
  };

  const onSubmit = async (
    aiDescriptionQuery: Omit<IApiAiDescriptionQuery, "searchResultSnapshotId">
  ) => {
    try {
      beforeSubmit();
      await generateLocationText(aiDescriptionQuery);
    } catch (err) {
      console.log(err);
      toastError("Der Fehler ist aufgetreten!");
      closeModal();
    } finally {
      postSubmit(false);
    }
  };

  return (
    <>
      <OpenAiLocationForm formId={formId!} onSubmit={onSubmit} />
      {locationDescription && (
        <div>
          <h3>Ihr KI-generierter Textvorschlag</h3>
          <div className="text-justify">{locationDescription}</div>
          <div
            className="mt-3 inline-flex gap-2 cursor-pointer items-center mt-3"
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
