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
  ApiOpenAiRespLimitTypesEnum,
  IApiOpenAiQuery,
  IApiOpenAiRealEstateDescriptionQuery,
  IOpenAiLocationDescriptionFormValues,
  OpenAiQueryTypeEnum,
  OpenAiTonalityEnum,
} from "../../../../shared/types/open-ai";
import {
  maxCharacterNumber,
  minCharacterNumber,
  openAiQueryTypes,
  openAiTonalities,
} from "../../../../shared/constants/open-ai";
import { placeholderSelectOptionKey } from "../../../../shared/constants/constants";
import { TPlaceholderSelectOptionKey } from "../../../../shared/types/types";
import OpenAiLocationDescriptionForm from "./OpenAiLocationDescriptionForm";
import { useOpenAi } from "../../hooks/openai";
import { toastError, toastSuccess } from "../../shared/shared.functions";
import copyIcon from "../../assets/icons/copy.svg";
import OpenAiRealEstateDescriptionForm from "./OpenAiRealEstateDescriptionForm";
import OpenAiQueryForm from "./OpenAiQueryForm";
import { TFormikInnerRef } from "../../shared/shared.types";
import {
  CachingActionTypesEnum,
  CachingContext,
} from "../../context/CachingContext";
import { usePotentialCustomerData } from "../../hooks/potentialcustomerdata";
import { defaultTargetGroupName } from "../../../../shared/constants/potential-customer";

// TODO move tonality, targetGroupName, characterLimit to a separate form
// TODO simplify customText to a string

interface IOpenAiModuleProps {
  searchResultSnapshotId: string;
  onModuleStatusChange: (isReady: boolean) => void;
  isFetchResponse: boolean;
  onResponseFetched: (responseText: string) => void;
  initialQueryType?: OpenAiQueryTypeEnum;
  onQueryTypeChange?: (queryType: OpenAiQueryTypeEnum) => void;
}

const OpenAiModule: FunctionComponent<IOpenAiModuleProps> = ({
  searchResultSnapshotId,
  onModuleStatusChange,
  isFetchResponse,
  onResponseFetched,
  initialQueryType,
  onQueryTypeChange,
}) => {
  const { cachingState, cachingDispatch } = useContext(CachingContext);

  const formRef =
    useRef<FormikProps<IOpenAiLocationDescriptionFormValues | IApiOpenAiQuery>>(
      null
    );
  const realEstateDescriptionFormRef =
    useRef<FormikProps<IApiOpenAiRealEstateDescriptionQuery>>(null);

  const { fetchPotentCustomerNames } = usePotentialCustomerData();
  const { fetchOpenAiResponse } = useOpenAi();

  const [queryType, setQueryType] = useState<
    OpenAiQueryTypeEnum | TPlaceholderSelectOptionKey | undefined
  >(initialQueryType);
  const [potentCustomerNames, setPotentCustomerNames] = useState<string[]>();
  const [fetchedResponse, setFetchedResponse] = useState<string>();

  const [tonality, setTonality] = useState<OpenAiTonalityEnum>(
    OpenAiTonalityEnum.FORMAL_SERIOUS
  );
  const [potentCustomerName, setPotentCustomerName] = useState<string>(
    defaultTargetGroupName
  );
  const [characterLimit, setCharacterLimit] = useState<number>(
    Math.round(maxCharacterNumber) / 2
  );

  useEffect(() => {
    const fetchTargetGroupNames = async () => {
      setPotentCustomerNames([
        defaultTargetGroupName,
        ...(await fetchPotentCustomerNames()),
      ]);
    };

    void fetchTargetGroupNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isFetchResponse || !queryType) {
      return;
    }

    const fetchResponse = async (): Promise<void> => {
      let response;

      switch (queryType) {
        case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION: {
          formRef.current?.handleSubmit();

          response = await fetchOpenAiResponse(queryType, {
            searchResultSnapshotId,
            tonality,
            targetGroupName: potentCustomerName,
            responseLimit: {
              quantity: characterLimit,
              type: ApiOpenAiRespLimitTypesEnum.CHARACTER,
            },
            ...(formRef.current
              ?.values as IOpenAiLocationDescriptionFormValues),
          });

          break;
        }

        case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
          realEstateDescriptionFormRef.current?.handleSubmit();

          response = await fetchOpenAiResponse(queryType, {
            tonality,
            targetGroupName: potentCustomerName,
            responseLimit: {
              quantity: characterLimit,
              type: ApiOpenAiRespLimitTypesEnum.CHARACTER,
            },
            ...(realEstateDescriptionFormRef.current
              ?.values as IApiOpenAiRealEstateDescriptionQuery),
          });

          break;
        }

        case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION: {
          formRef.current?.handleSubmit();
          realEstateDescriptionFormRef.current?.handleSubmit();

          response = await fetchOpenAiResponse(queryType, {
            searchResultSnapshotId,
            tonality,
            targetGroupName: potentCustomerName,
            responseLimit: {
              quantity: characterLimit,
              type: ApiOpenAiRespLimitTypesEnum.CHARACTER,
            },
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

          response = await fetchOpenAiResponse(queryType, {
            ...(formRef.current?.values as IApiOpenAiQuery),
            isFormalToInformal:
              queryType === OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
          });

          break;
        }

        default: {
          toastError("Der Fehler ist aufgetreten!");
          return;
        }
      }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-2">
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
            {openAiQueryTypes.map(({ type, label }) => (
              <option value={type} key={type} className="flex flex-col">
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label htmlFor="targetGroupName" className="label">
            <span className="label-text">Zielgruppe Name</span>
          </label>

          <select
            className="select select-bordered w-full max-w-xs"
            name="targetGroupName"
            value={potentCustomerName}
            onChange={({ target: { value } }) => {
              setPotentCustomerName(value);
            }}
          >
            {potentCustomerNames?.map((targetGroupName) => (
              <option
                value={targetGroupName}
                key={`target-group-${targetGroupName}`}
                className="flex flex-col"
              >
                {targetGroupName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label htmlFor="tonality" className="label">
            <span className="label-text">Texttonalität</span>
          </label>

          <select
            className="select select-bordered w-full max-w-xs"
            name="tonality"
            value={tonality}
            onChange={({ target: { value } }) => {
              setTonality(value as OpenAiTonalityEnum);
            }}
          >
            {Object.keys(openAiTonalities).map((tonalityType) => (
              <option
                value={tonalityType}
                key={tonalityType}
                className="flex flex-col"
              >
                {openAiTonalities[tonalityType as OpenAiTonalityEnum]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label htmlFor="characterLimit" className="label">
            <span className="label-text">Gewünschte Zeichenanzahl</span>
          </label>

          <div className="flex w-full items-center gap-2">
            <input
              className="input input-bordered range w-full max-w-xs"
              name="characterLimit"
              type="range"
              min={minCharacterNumber}
              max={maxCharacterNumber}
              step={100}
              value={characterLimit}
              onInput={({ target }) => {
                setCharacterLimit(+(target as HTMLInputElement).value);
              }}
            />
            <div>{characterLimit}</div>
          </div>
        </div>
      </div>

      <div className="divider mb-2" />

      {queryType === OpenAiQueryTypeEnum.LOCATION_DESCRIPTION && (
        <OpenAiLocationDescriptionForm
          formId="open-ai-location-description-form"
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
          formId="open-ai-real-estate-description-form"
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
            formId="open-ai-location-description-form"
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
            formId="open-ai-real-estate-description-form"
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
          formId="open-ai-formal-to-informal-form"
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
          formId="open-ai-general-question-form"
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
        <>
          <h3 className="text-black">Ihr KI-generierter Textvorschlag</h3>
          <div className="flex flex-col gap-2">
            <div className="text-justify">{fetchedResponse}</div>
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
