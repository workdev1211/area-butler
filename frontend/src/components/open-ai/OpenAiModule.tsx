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
  IOpenAiLocationDescriptionFormValues,
  IApiOpenAiQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  OpenAiQueryTypeEnum,
} from "../../../../shared/types/open-ai";
import { openAiQueryTypes } from "../../../../shared/constants/open-ai";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import {
  RequestStatusTypesEnum,
  TPlaceholderSelectOptionKey,
} from "../../../../shared/types/types";
import OpenAiLocationDescriptionForm from "./OpenAiLocationDescriptionForm";
import { useOpenAiData } from "../../hooks/openaidata";
import { toastError, toastSuccess } from "../../shared/shared.functions";
import copyIcon from "../../assets/icons/copy.svg";
import OpenAiRealEstateDescriptionForm from "./OpenAiRealEstateDescriptionForm";
import OpenAiQueryForm from "./OpenAiQueryForm";
import { TFormikInnerRef } from "../../shared/shared.types";
import {
  CachingActionTypesEnum,
  CachingContext,
} from "../../context/CachingContext";
import { UserContext } from "../../context/UserContext";
import { SearchContext } from "../../context/SearchContext";

interface IOpenAiModuleProps {
  searchResultSnapshotId: string;
  onModuleStatusChange: (isReady: boolean) => void;
  isFetchResponse: boolean;
  onResponseFetched: (
    queryType: OpenAiQueryTypeEnum,
    requestStatus: RequestStatusTypesEnum
  ) => void;
  initialQueryType?: OpenAiQueryTypeEnum;
}

const OpenAiModule: FunctionComponent<IOpenAiModuleProps> = ({
  searchResultSnapshotId,
  onModuleStatusChange,
  isFetchResponse,
  onResponseFetched,
  initialQueryType,
}) => {
  const { cachingState, cachingDispatch } = useContext(CachingContext);
  const {
    searchContextState: { integrationId },
  } = useContext(SearchContext);
  const {
    userState: { integrationUser },
  } = useContext(UserContext);

  const formRef = useRef<FormikProps<unknown>>(null);
  const realEstateDescriptionFormRef =
    useRef<FormikProps<IApiOpenAiRealEstateDescriptionQuery>>(null);

  const {
    fetchLocationDescription,
    fetchRealEstateDescription,
    fetchLocRealEstDesc,
    fetchQuery,
  } = useOpenAiData(!!integrationUser);

  const [queryType, setQueryType] = useState<
    OpenAiQueryTypeEnum | TPlaceholderSelectOptionKey | undefined
  >(initialQueryType);
  const [fetchedResponse, setFetchedResponse] = useState<string>();

  useEffect(() => {
    if (!isFetchResponse || !queryType) {
      return;
    }

    const fetchResponse = async (): Promise<void> => {
      let response;
      let requestStatus = RequestStatusTypesEnum.SUCCESS;

      try {
        switch (queryType) {
          case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION: {
            formRef.current?.handleSubmit();

            response = await fetchLocationDescription({
              searchResultSnapshotId,
              ...(formRef.current
                ?.values as IOpenAiLocationDescriptionFormValues),
            });
            break;
          }

          case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
            realEstateDescriptionFormRef.current?.handleSubmit();

            response = await fetchRealEstateDescription({
              integrationId,
              ...(realEstateDescriptionFormRef.current
                ?.values as IApiOpenAiRealEstateDescriptionQuery),
            });
            break;
          }

          case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION: {
            formRef.current?.handleSubmit();
            realEstateDescriptionFormRef.current?.handleSubmit();
            const a1 = {
              searchResultSnapshotId,
              integrationId,
              ...(formRef.current
                ?.values as IOpenAiLocationDescriptionFormValues),
              ...(realEstateDescriptionFormRef.current
                ?.values as IApiOpenAiRealEstateDescriptionQuery),
            };
            console.log(1, a1);

            response = await fetchLocRealEstDesc({
              searchResultSnapshotId,
              integrationId,
              ...(formRef.current
                ?.values as IOpenAiLocationDescriptionFormValues),
              ...(realEstateDescriptionFormRef.current
                ?.values as IApiOpenAiRealEstateDescriptionQuery),
            });
            break;
          }

          case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
          case OpenAiQueryTypeEnum.GENERAL_QUESTION: {
            formRef.current?.handleSubmit();

            response = await fetchQuery({
              ...(formRef.current?.values as IApiOpenAiQuery),
              isFormalToInformal:
                queryType === OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
            });
            break;
          }
        }
      } catch (e) {
        toastError("Fehler beim Senden der KI-Anfrage!");
        requestStatus = RequestStatusTypesEnum.FAILURE;
      }

      onResponseFetched(queryType as OpenAiQueryTypeEnum, requestStatus);
      setFetchedResponse(response);
    };

    void fetchResponse();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFetchResponse,
    onResponseFetched,
    queryType,
    searchResultSnapshotId,
    integrationId,
  ]);

  useEffect(() => {
    if (queryType === OpenAiQueryTypeEnum.LOCATION_DESCRIPTION) {
      onModuleStatusChange(true);
    }
  }, [onModuleStatusChange, queryType]);

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
          }}
        >
          <option
            value={placeholderSelectOptionKey}
            key={placeholderSelectOptionKey}
            disabled={true}
          >
            Was möchten Sie generieren?
          </option>
          {openAiQueryTypes.map(({ type, label }) => (
            <option value={type} key={type} className="flex flex-col">
              {label}
            </option>
          ))}
        </select>

        {queryType === OpenAiQueryTypeEnum.LOCATION_DESCRIPTION && (
          <OpenAiLocationDescriptionForm
            formId={"open-ai-location-description-form"}
            initialValues={cachingState.openAi.locationDescription}
            onValuesChange={(values) => {
              cachingDispatch({
                type: CachingActionTypesEnum.SET_OPEN_AI,
                payload: { locationDescription: { ...values } },
              });
            }}
            formRef={
              formRef as TFormikInnerRef<IOpenAiLocationDescriptionFormValues>
            }
          />
        )}

        {queryType === OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION && (
          <OpenAiRealEstateDescriptionForm
            formId={"open-ai-real-estate-description-form"}
            initialValues={cachingState.openAi.realEstateDescription}
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
            formRef={realEstateDescriptionFormRef}
          />
        )}

        {queryType === OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION && (
          <>
            <OpenAiLocationDescriptionForm
              formId={"open-ai-location-description-form"}
              initialValues={cachingState.openAi.locationDescription}
              onValuesChange={(values) => {
                cachingDispatch({
                  type: CachingActionTypesEnum.SET_OPEN_AI,
                  payload: { locationDescription: { ...values } },
                });
              }}
              formRef={
                formRef as TFormikInnerRef<IOpenAiLocationDescriptionFormValues>
              }
            />
            <OpenAiRealEstateDescriptionForm
              formId={"open-ai-real-estate-description-form"}
              initialValues={cachingState.openAi.realEstateDescription}
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
              formRef={realEstateDescriptionFormRef}
            />
          </>
        )}

        {queryType === OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL && (
          <OpenAiQueryForm
            formId={"open-ai-formal-to-informal-form"}
            initialValues={cachingState.openAi.query}
            onValuesChange={(values) => {
              onModuleStatusChange(!!queryType && !!values.text);

              cachingDispatch({
                type: CachingActionTypesEnum.SET_OPEN_AI,
                payload: { query: { ...values } },
              });
            }}
            formRef={formRef as TFormikInnerRef<IApiOpenAiQuery>}
          />
        )}

        {queryType === OpenAiQueryTypeEnum.GENERAL_QUESTION && (
          <OpenAiQueryForm
            formId={"open-ai-general-question-form"}
            initialValues={cachingState.openAi.query}
            onValuesChange={(values) => {
              onModuleStatusChange(!!queryType && !!values.text);

              cachingDispatch({
                type: CachingActionTypesEnum.SET_OPEN_AI,
                payload: { query: { ...values } },
              });
            }}
            formRef={formRef as TFormikInnerRef<IApiOpenAiQuery>}
          />
        )}

        {fetchedResponse && (
          <div>
            <h3 className="text-black">Ihr KI-generierter Textvorschlag</h3>
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
