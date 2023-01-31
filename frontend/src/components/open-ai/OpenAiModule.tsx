import { FunctionComponent, useEffect, useRef, useState } from "react";
import { FormikProps } from "formik/dist/types";
import copy from "copy-to-clipboard";

import {
  IOpenAiLocationFormValues,
  OpenAiQueryTypeEnum,
} from "../../../../shared/types/open-ai";
import { openAiQueryType } from "../../../../shared/constants/open-ai";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import { TPlaceholderSelectOptionKey } from "../../../../shared/types/types";
import OpenAiLocationDescriptionForm from "./OpenAiLocationDescriptionForm";
import { useOpenAiData } from "../../hooks/openaidata";
import { toastSuccess } from "../../shared/shared.functions";
import copyIcon from "../../assets/icons/copy.svg";

interface IOpenAiModuleProps {
  searchResultSnapshotId: string;
  onQueryTypeChange: (queryType: OpenAiQueryTypeEnum) => void;
  isFetchResponse: boolean;
  onResponseFetched: () => void;
}

const OpenAiModule: FunctionComponent<IOpenAiModuleProps> = ({
  searchResultSnapshotId,
  onQueryTypeChange,
  isFetchResponse,
  onResponseFetched,
}) => {
  const formRef = useRef<FormikProps<IOpenAiLocationFormValues>>(null);
  const { fetchLocationDescription } = useOpenAiData();
  const [queryType, setQueryType] = useState<
    OpenAiQueryTypeEnum | TPlaceholderSelectOptionKey
  >(placeholderSelectOptionKey);
  const [fetchedResponse, setFetchedResponse] = useState<string>();

  useEffect(() => {
    if (!isFetchResponse) {
      return;
    }

    const fetchResponse = async (): Promise<string> => {
      formRef.current?.handleSubmit();
      let response = "";

      switch (queryType) {
        case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION: {
          response = await fetchLocationDescription({
            searchResultSnapshotId,
            ...(formRef.current?.values as IOpenAiLocationFormValues),
          });
          break;
        }
      }

      onResponseFetched();
      setFetchedResponse(response);

      return response;
    };

    void fetchResponse();
  }, [
    fetchLocationDescription,
    isFetchResponse,
    onResponseFetched,
    queryType,
    searchResultSnapshotId,
  ]);

  return (
    <div>
      <div className="form-control">
        <label htmlFor="queryType" className="label">
          <span className="label-text">Option wählen</span>
        </label>
        <select
          className="select select-bordered w-full max-w-xs"
          name="queryType"
          defaultValue={queryType}
          onChange={({ target: { value } }) => {
            setQueryType(value as OpenAiQueryTypeEnum);
            onQueryTypeChange(value as OpenAiQueryTypeEnum);
          }}
        >
          <option
            value={placeholderSelectOptionKey}
            key={placeholderSelectOptionKey}
            disabled={true}
          >
            Was möchten Sie generieren?
          </option>
          {openAiQueryType.map(({ type, label }) => (
            <option value={type} key={type} className="flex flex-col">
              {label}
            </option>
          ))}
        </select>
        {queryType === OpenAiQueryTypeEnum.LOCATION_DESCRIPTION && (
          <OpenAiLocationDescriptionForm
            formId={"open-ai-location-description-form"}
            onSubmit={() => {}}
            formRef={formRef}
          />
        )}

        {fetchedResponse && (
          <div>
            <h3>Ihr KI-generierter Textvorschlag</h3>
            <div className="text-justify">{fetchedResponse}</div>
            <div
              className="mt-3 inline-flex gap-2 cursor-pointer items-center mt-3"
              onClick={() => {
                const success = copy(fetchedResponse);

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
              Nicht zufrieden? Mit Klick auf "Generieren" wird ein neuer Text
              für Sie erstellt!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenAiModule;
