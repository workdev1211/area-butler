import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FormikProps } from "formik/dist/types";
import copy from "copy-to-clipboard";

import {
  IApiOpenAiQuery,
  IApiOpenAiRealEstDescQuery,
  IOpenAiGeneralFormValues,
  IOpenAiLocDescFormValues,
  OpenAiQueryTypeEnum,
} from "../../../../shared/types/open-ai";
import { openAiQueryTypes } from "../../../../shared/constants/open-ai";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import { TPlaceholderSelectOptionKey } from "../../../../shared/types/types";
import OpenAiLocDescForm from "./OpenAiLocDescForm";
import { TOpenAiQuery, useOpenAi } from "../../hooks/openai";
import { toastError, toastSuccess } from "../../shared/shared.functions";
import copyIcon from "../../assets/icons/copy.svg";
import OpenAiRealEstDescForm from "./OpenAiRealEstDescForm";
import OpenAiQueryForm from "./OpenAiQueryForm";
import {
  CachingActionTypesEnum,
  CachingContext,
} from "../../context/CachingContext";
import OpenAiGeneralForm from "./OpenAiGeneralForm";

interface IOpenAiModuleProps {
  onModuleStatusChange: (isReady: boolean) => void;
  isFetchResponse: boolean;
  onResponseFetched: (responseText: string) => void;
  initialQueryType?: OpenAiQueryTypeEnum;
  onQueryTypeChange?: (queryType: OpenAiQueryTypeEnum) => void;
  searchResultSnapshotId?: string;
}

const OpenAiModule: FunctionComponent<IOpenAiModuleProps> = ({
  onModuleStatusChange,
  isFetchResponse,
  onResponseFetched,
  initialQueryType,
  onQueryTypeChange,
  searchResultSnapshotId,
}) => {
  const {
    cachingState: { openAi: cachedOpenAi },
    cachingDispatch,
  } = useContext(CachingContext);

  const generalFormRef = useRef<FormikProps<IOpenAiGeneralFormValues>>(null);
  const locDescFormRef = useRef<FormikProps<IOpenAiLocDescFormValues>>(null);
  const realEstDescFormRef =
    useRef<FormikProps<IApiOpenAiRealEstDescQuery>>(null);
  const formRef = useRef<FormikProps<IApiOpenAiQuery>>(null);

  const { fetchOpenAiResponse } = useOpenAi();

  const [queryType, setQueryType] = useState<
    OpenAiQueryTypeEnum | TPlaceholderSelectOptionKey | undefined
  >(initialQueryType);
  const [fetchedResponse, setFetchedResponse] = useState<string>();

  const resultQueryTypes = searchResultSnapshotId
    ? openAiQueryTypes
    : openAiQueryTypes.filter(
        ({ type }) =>
          ![
            OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
            OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
          ].includes(type)
      );

  useEffect(() => {
    if (!isFetchResponse || !queryType) {
      return;
    }

    const fetchResponse = async (): Promise<void> => {
      generalFormRef.current?.handleSubmit();
      let query: TOpenAiQuery;

      switch (queryType) {
        case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION: {
          formRef.current?.handleSubmit();

          query = {
            searchResultSnapshotId: searchResultSnapshotId!,
            ...generalFormRef.current!.values,
            ...locDescFormRef.current!.values,
          };

          break;
        }

        case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
          realEstDescFormRef.current?.handleSubmit();

          query = {
            ...generalFormRef.current!.values,
            ...realEstDescFormRef.current!.values,
          };

          break;
        }

        case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION: {
          formRef.current?.handleSubmit();
          realEstDescFormRef.current?.handleSubmit();

          query = {
            searchResultSnapshotId: searchResultSnapshotId!,
            ...generalFormRef.current!.values,
            ...locDescFormRef.current!.values,
            ...realEstDescFormRef.current!.values,
          };

          break;
        }

        case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
        case OpenAiQueryTypeEnum.GENERAL_QUESTION: {
          formRef.current?.handleSubmit();

          query = {
            ...formRef.current!.values,
            isFormalToInformal:
              queryType === OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
          };

          break;
        }

        default: {
          toastError("Der Fehler ist aufgetreten!");
          return;
        }
      }

      const response = await fetchOpenAiResponse(queryType, query);

      onResponseFetched(response);
      setFetchedResponse(response);
    };

    void fetchResponse();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchResponse, queryType, searchResultSnapshotId]);

  useEffect(() => {
    if (queryType === OpenAiQueryTypeEnum.LOCATION_DESCRIPTION) {
      onModuleStatusChange(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryType]);

  return (
    <div>
      <div className="form-control">
        <label htmlFor="queryType" className="label">
          <span className="label-text">Option wählen</span>
        </label>

        <select
          className="select select-bordered w-full max-w-xs"
          name="queryType"
          value={queryType || placeholderSelectOptionKey}
          onChange={({ target: { value } }) => {
            setQueryType(value as OpenAiQueryTypeEnum);

            if (onQueryTypeChange) {
              onQueryTypeChange(value as OpenAiQueryTypeEnum);
            }
          }}
        >
          <option
            value={placeholderSelectOptionKey}
            key={placeholderSelectOptionKey}
            disabled={true}
          >
            Was möchten Sie generieren?
          </option>
          {resultQueryTypes.map(({ type, label }) => (
            <option value={type} key={type} className="flex flex-col">
              {label}
            </option>
          ))}
        </select>
      </div>

      {![
        OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
        OpenAiQueryTypeEnum.GENERAL_QUESTION,
      ].includes(queryType as OpenAiQueryTypeEnum) && (
        <>
          <div className="divider mb-2" />

          <OpenAiGeneralForm
            formId="open-ai-general-form"
            initialValues={cachedOpenAi.general}
            onValuesChange={(values) => {
              cachingDispatch({
                type: CachingActionTypesEnum.SET_OPEN_AI,
                payload: { general: { ...values } },
              });
            }}
            formRef={generalFormRef}
          />
        </>
      )}

      <div className="divider mb-2" />

      {queryType === OpenAiQueryTypeEnum.LOCATION_DESCRIPTION && (
        <OpenAiLocDescForm
          formId="open-ai-loc-desc-form"
          initialValues={cachedOpenAi.locationDescription}
          onValuesChange={(values) => {
            cachingDispatch({
              type: CachingActionTypesEnum.SET_OPEN_AI,
              payload: { locationDescription: { ...values } },
            });
          }}
          formRef={locDescFormRef}
        />
      )}

      {queryType === OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION && (
        <OpenAiRealEstDescForm
          formId="open-ai-real-est-desc-form"
          initialValues={cachedOpenAi.realEstateDescription}
          onValuesChange={(values) => {
            onModuleStatusChange(
              !!queryType &&
                !!values.realEstateListingId &&
                values.realEstateListingId !== placeholderSelectOptionKey
            );

            cachingDispatch({
              type: CachingActionTypesEnum.SET_OPEN_AI,
              payload: { realEstateDescription: { ...values } },
            });
          }}
          formRef={realEstDescFormRef}
        />
      )}

      {queryType === OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION && (
        <>
          <OpenAiLocDescForm
            formId="open-ai-loc-desc-form"
            initialValues={cachedOpenAi.locationDescription}
            onValuesChange={(values) => {
              cachingDispatch({
                type: CachingActionTypesEnum.SET_OPEN_AI,
                payload: { locationDescription: { ...values } },
              });
            }}
            formRef={locDescFormRef}
          />

          <OpenAiRealEstDescForm
            formId="open-ai-real-est-desc-form"
            initialValues={cachedOpenAi.realEstateDescription}
            onValuesChange={(values) => {
              onModuleStatusChange(
                !!queryType &&
                  !!values.realEstateListingId &&
                  values.realEstateListingId !== placeholderSelectOptionKey
              );

              cachingDispatch({
                type: CachingActionTypesEnum.SET_OPEN_AI,
                payload: { realEstateDescription: { ...values } },
              });
            }}
            formRef={realEstDescFormRef}
          />
        </>
      )}

      {queryType === OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL && (
        <OpenAiQueryForm
          formId="open-ai-formal-to-informal-form"
          initialValues={cachedOpenAi.query}
          onValuesChange={(values) => {
            onModuleStatusChange(!!queryType && !!values.text);

            cachingDispatch({
              type: CachingActionTypesEnum.SET_OPEN_AI,
              payload: { query: { ...values } },
            });
          }}
          formRef={formRef}
        />
      )}

      {queryType === OpenAiQueryTypeEnum.GENERAL_QUESTION && (
        <OpenAiQueryForm
          formId="open-ai-general-question-form"
          initialValues={cachedOpenAi.query}
          onValuesChange={(values) => {
            onModuleStatusChange(!!queryType && !!values.text);

            cachingDispatch({
              type: CachingActionTypesEnum.SET_OPEN_AI,
              payload: { query: { ...values } },
            });
          }}
          formRef={formRef}
        />
      )}

      {fetchedResponse && (
        <>
          <h3 className="text-black">Ihr KI-generierter Textvorschlag</h3>
          <div className="flex flex-col gap-2">
            <textarea
              className="textarea textarea-bordered w-full"
              rows={7}
              value={fetchedResponse}
              onChange={({ target: { value } }) => {
                onResponseFetched(value);
                setFetchedResponse(value);
              }}
            />
            <div
              className="flex gap-2 cursor-pointer items-center"
              onClick={(): void => {
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
              className="text-sm font-bold pt-2"
              style={{ border: 0, borderTop: "1px solid black" }}
            >
              Nicht zufrieden? Mit Klick auf "Generieren" wird ein neuer Text
              für Sie erstellt!
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OpenAiModule;
