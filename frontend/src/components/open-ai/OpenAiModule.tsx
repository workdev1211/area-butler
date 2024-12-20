import { FC, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import {
  IApiOpenAiQuery,
  IApiOpenAiRealEstDescQuery,
  IOpenAiGeneralFormValues,
  IOpenAiLocDescFormValues,
  OpenAiQueryTypeEnum,
} from "../../../../shared/types/open-ai";
import {
  openAiCustomTextOptions,
  openAiQueryTypes,
  openAiRealEstTypeOptions,
} from "../../../../shared/constants/open-ai";
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
import { SearchContext } from "../../context/SearchContext";
import { ConfigContext } from "../../context/ConfigContext";
import { IntegrationTypesEnum } from "../../../../shared/types/integration";
import { TIntUserExpMatchParams } from "../../../../shared/types/integration-user";
import { TFormikInnerRef } from "../../shared/shared.types";
import { useUserState } from "../../hooks/userstate";
import { IOpenAiPresetValues } from "./OpenAiChat";

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
  fixedQueryType?: undefined | boolean;
  generalFormRef: TFormikInnerRef<IOpenAiGeneralFormValues>;
  locDescFormRef: TFormikInnerRef<IOpenAiLocDescFormValues>;
  realEstDescFormRef: TFormikInnerRef<IApiOpenAiRealEstDescQuery>;
  formRef: TFormikInnerRef<IApiOpenAiQuery>;
}

const OpenAiModule: FC<IOpenAiModuleProps> = ({
  onModuleStatusChange,
  isFetchResponse,
  onResponseFetched,
  initialQueryType,
  onQueryTypeChange,
  searchResultSnapshotId,
  fixedQueryType,
  generalFormRef,
  locDescFormRef,
  realEstDescFormRef,
  formRef,
}) => {
  const { t } = useTranslation();
  const {
    cachingState: { openAi: cachedOpenAi },
    cachingDispatch,
  } = useContext(CachingContext);
  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);
  const { integrationType } = useContext(ConfigContext);

  const { getCurrentUser } = useUserState();
  const user = getCurrentUser();
  const config = user?.config;

  const [queryType, setQueryType] = useState<
    OpenAiQueryTypeEnum | TPlaceholderSelectOptionKey | undefined
  >(initialQueryType);

  const [preset, setPreset] = useState(
    (user.config.presets
      ? user.config.presets[queryType as OpenAiQueryTypeEnum]
      : undefined) as IOpenAiPresetValues | undefined
  );

  const { fetchOpenAiResponse } = useOpenAi();

  const defaultTextLength =
    queryType &&
    config?.exportMatching &&
    (config?.exportMatching as Record<string, TIntUserExpMatchParams>)[
      queryType
    ]?.maxTextLength;

  const resultQueryTypes = (
    searchResultSnapshotId
      ? openAiQueryTypes
      : openAiQueryTypes.filter(
          ({ type }) =>
            ![
              OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
              OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
            ].includes(type)
        )
  ).filter(
    ({ type }) =>
      integrationType === IntegrationTypesEnum.PROPSTACK ||
      integrationType === IntegrationTypesEnum.ON_OFFICE ||
      type !== OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION
  );

  useEffect(() => {
    if (!isFetchResponse || !queryType) {
      return;
    }

    const fetchResponse = async (): Promise<void> => {
      generalFormRef.current?.handleSubmit();
      let query: TOpenAiQuery;

      const realEstateValues = realEstDescFormRef.current?.values;
      if (realEstateValues) {
        realEstateValues.realEstateType =
          openAiRealEstTypeOptions.find(
            ({ value }) => value === realEstateValues.realEstateType
          )?.text || realEstateValues.realEstateType;
      }

      const generalValues = generalFormRef.current!.values;
      generalValues.customText = openAiCustomTextOptions.find(
        ({ value }) => value === generalValues.customText
      )?.text;

      switch (queryType) {
        case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
        case OpenAiQueryTypeEnum.MACRO_LOC_DESC:
        case OpenAiQueryTypeEnum.MICRO_LOC_DESC:
        case OpenAiQueryTypeEnum.DISTRICT_DESC: {
          formRef.current?.handleSubmit();

          query = {
            language: responseConfig?.language,
            snapshotId: searchResultSnapshotId!,
            ...generalValues,
            ...locDescFormRef.current!.values,
          };

          break;
        }

        case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
        case OpenAiQueryTypeEnum.FACEBOOK_POST:
        case OpenAiQueryTypeEnum.INSTAGRAM_CAPTION: {
          formRef.current?.handleSubmit();
          realEstDescFormRef.current?.handleSubmit();

          query = {
            language: responseConfig?.language,
            snapshotId: searchResultSnapshotId!,
            ...generalValues,
            ...locDescFormRef.current!.values,
            ...realEstateValues,
          };

          break;
        }
        case OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION:
        case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION: {
          realEstDescFormRef.current?.handleSubmit();

          query = {
            language: responseConfig?.language,
            ...generalValues,
            ...realEstateValues!,
          };

          break;
        }

        case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
        case OpenAiQueryTypeEnum.GENERAL_QUESTION: {
          formRef.current?.handleSubmit();

          query = {
            language: responseConfig?.language,
            ...formRef.current!.values,
            isFormalToInformal:
              queryType === OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
          };

          break;
        }

        default: {
          toastError(t(IntlKeys.snapshotEditor.dataTab.errorOccurred));
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
    if (
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.MACRO_LOC_DESC,
        OpenAiQueryTypeEnum.MICRO_LOC_DESC,
        OpenAiQueryTypeEnum.DISTRICT_DESC,
      ].includes(queryType as OpenAiQueryTypeEnum)
    ) {
      onModuleStatusChange(true);
    }

    setPreset(
      (user.config.presets
        ? user.config.presets[queryType as OpenAiQueryTypeEnum]
        : undefined) as IOpenAiPresetValues | undefined
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryType]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-0">
      <div>
        <div className="section-title mb-2">
          {t(IntlKeys.snapshotEditor.dataTab.contentDetails)}
        </div>

        <div className="form-control">
          <label htmlFor="queryType" className="label">
            <span className="label-text">
              {t(IntlKeys.snapshotEditor.dataTab.targetFormat)}
            </span>
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
              {t(IntlKeys.snapshotEditor.dataTab.generateQuestion)}
            </option>
            {resultQueryTypes.map(({ type }) => (
              <option value={type} key={type} className="flex flex-col">
                {t(
                  (
                    IntlKeys.snapshotEditor.dataTab
                      .openAITypesOptionLabel as Record<string, string>
                  )[type]
                )}
              </option>
            ))}
          </select>
        </div>

        {[
          OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
          OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
          OpenAiQueryTypeEnum.FACEBOOK_POST,
          OpenAiQueryTypeEnum.INSTAGRAM_CAPTION,
          OpenAiQueryTypeEnum.MACRO_LOC_DESC,
          OpenAiQueryTypeEnum.MICRO_LOC_DESC,
          OpenAiQueryTypeEnum.DISTRICT_DESC,
        ].includes(queryType as OpenAiQueryTypeEnum) && (
          <OpenAiLocDescForm
            formId="open-ai-loc-desc-form"
            initialValues={
              preset?.locationDescription || cachedOpenAi.locationDescription
            }
            onValuesChange={(values) => {
              cachingDispatch({
                type: CachingActionTypesEnum.SET_OPEN_AI,
                payload: { locationDescription: { ...values } },
              });
            }}
            formRef={locDescFormRef}
          />
        )}

        {[
          OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
          OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
          OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
          OpenAiQueryTypeEnum.FACEBOOK_POST,
          OpenAiQueryTypeEnum.INSTAGRAM_CAPTION,
        ].includes(queryType as OpenAiQueryTypeEnum) && (
          <OpenAiRealEstDescForm
            formId="open-ai-real-est-desc-form"
            initialValues={
              preset?.realEstateDescription
                ? { ...preset.realEstateDescription, realEstateId: "" }
                : cachedOpenAi.realEstateDescription
            }
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

        {[
          OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
          OpenAiQueryTypeEnum.GENERAL_QUESTION,
        ].includes(queryType as OpenAiQueryTypeEnum) && (
          <OpenAiQueryForm
            formId="open-ai-formal-to-informal-form"
            initialValues={preset?.query || cachedOpenAi.query}
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
            <div className="section-title mb-2">
              {t(IntlKeys.snapshotEditor.dataTab.textualInformation)}
            </div>

            <OpenAiGeneralForm
              formId="open-ai-general-form"
              initialValues={preset?.general || cachedOpenAi.general}
              defaultTextLength={defaultTextLength || 2000}
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
