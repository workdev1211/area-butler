import { FunctionComponent, useState } from "react";

import { useHttp } from "hooks/http";
import { toastError, toastSuccess } from "shared/shared.functions";
import OpenAiLocationForm from "./OpenAiLocationForm";
import { MeansOfTransportation } from "../../../shared/types/types";
import { OpenAiTonalityEnum } from "../../../shared/types/open-ai";
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
  const { get } = useHttp();
  const [locationDescription, setLocationDescription] = useState<string>();

  const generateLocationText = async (
    meanOfTransportation: MeansOfTransportation,
    tonality: OpenAiTonalityEnum
  ) => {
    let url = "/api/location/open-ai-location-description";
    url += `?searchResultSnapshotId=${searchResultSnapshotId}`;
    url += `&meanOfTransportation=${meanOfTransportation}`;
    url += `&tonality=${tonality}`;

    setLocationDescription((await get<string>(url)).data);
  };

  const onSubmit = async ({
    meanOfTransportation,
    tonality,
  }: {
    meanOfTransportation: MeansOfTransportation;
    tonality: OpenAiTonalityEnum;
  }) => {
    try {
      beforeSubmit();
      await generateLocationText(meanOfTransportation, tonality);
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
          <h3 className="flex items-center gap-2">
            <span>Ortsbeschreibung</span>
            <img
              src={copyIcon}
              alt="copy-icon"
              onClick={async () => {
                await navigator.clipboard.writeText(locationDescription);
                toastSuccess("Kopiert");
              }}
              style={{
                width: "16px",
                height: "16px",
                filter:
                  "invert(14%) sepia(66%) saturate(4788%) hue-rotate(333deg) brightness(98%) contrast(96%)",
                cursor: "pointer",
              }}
            />
          </h3>
          <span className="break-all text-justify">{locationDescription}</span>
        </div>
      )}
    </>
  );
};

export default OpenAiLocationFormHandler;
