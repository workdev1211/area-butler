import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useTranslation } from 'react-i18next';
import { IntlKeys } from 'i18n/keys';

import { FormikProps } from "formik/dist/types";

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
import { toastError } from "../../shared/shared.functions";
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
  onResponseFetched: (
    responseText: string,
    queryType: OpenAiQueryTypeEnum,
    query?: TOpenAiQuery
  ) => void;
  initialQueryType?: OpenAiQueryTypeEnum;
  onQueryTypeChange?: (queryType: OpenAiQueryTypeEnum) => void;
  searchResultSnapshotId?: string;
  showResult?: boolean;
  fixedQueryType?: undefined | boolean;
}

const OpenAiModule: FunctionComponent<IOpenAiModuleProps> = ({
  onModuleStatusChange,
  isFetchResponse,
  onResponseFetched,
  initialQueryType,
  onQueryTypeChange,
  searchResultSnapshotId,
  showResult,
  fixedQueryType,
}) => {
  const { t } = useTranslation();
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
            snapshotId: searchResultSnapshotId!,
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
            snapshotId: searchResultSnapshotId!,
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
          toastError(t(IntlKeys.snapshotEditor.exportTab.errorOccurred));
          return;
        }
      }

      const response = await fetchOpenAiResponse(queryType, query);
      onResponseFetched(response, queryType, query);
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-0">
      <div>
        <div className="section-title mb-2">{t(IntlKeys.snapshotEditor.exportTab.contentDetails)}</div>

        <div className="form-control">
          <label htmlFor="queryType" className="label">
            <span className="label-text">{t(IntlKeys.snapshotEditor.exportTab.targetFormat)}</span>
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
            disabled={fixedQueryType}
          >
            <option
              value={placeholderSelectOptionKey}
              key={placeholderSelectOptionKey}
              disabled={true}
            >
              {t(IntlKeys.snapshotEditor.exportTab.generateQuestion)}
            </option>
            {resultQueryTypes.map(({ type, label }) => (
              <option value={type} key={type} className="flex flex-col">
                {t((IntlKeys.snapshotEditor.exportTab.openAITypesOptionLabel as Record<string, string>)[type])}
              </option>
            ))}
          </select>
        </div>
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
                  !!values.realEstateId &&
                  values.realEstateId !== placeholderSelectOptionKey
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
                    !!values.realEstateId &&
                    values.realEstateId !== placeholderSelectOptionKey
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
      </div>
      <div>
        {![
          OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
          OpenAiQueryTypeEnum.GENERAL_QUESTION,
        ].includes(queryType as OpenAiQueryTypeEnum) && (
          <>
            <div className="section-title mb-2">{t(IntlKeys.snapshotEditor.exportTab.textualInformation)}</div>

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
      </div>
    </div>
  );
};

export default OpenAiModule;
