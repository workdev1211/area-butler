import { FC, Fragment, useContext, useEffect, useRef, useState } from "react";
import { FormikProps } from "formik/dist/types";

import { useTranslation } from "react-i18next";
import { IntlKeys } from "i18n/keys";

import OpenAiModule from "./OpenAiModule";
import {
  IApiOpenAiQuery,
  IApiOpenAiRealEstDescQuery,
  IOpenAiGeneralFormValues,
  IOpenAiLocDescFormValues,
  OpenAiQueryTypeEnum,
} from "../../../../shared/types/open-ai";
import copy from "copy-to-clipboard";
import personIcon from "../../assets/icons/person.svg";
import areaButlerLogo from "../../assets/icons/areabutler.svg";
import copyIcon from "../../assets/icons/copy.svg";
import editIcon from "../../assets/icons/edit.svg";
import deleteIcon from "../../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import saveIcon from "../../assets/icons/check.svg";
import cancelIcon from "../../assets/icons/cancel.svg";
import shareIcon from "../../assets/icons/share.svg";
import {
  IntegrationTypesEnum,
  TSendToIntegrationData,
} from "../../../../shared/types/integration";
import { integrationNames } from "../../../../shared/constants/integration";

import { TOpenAiQuery, useOpenAi } from "../../hooks/openai";
import {
  openAiQueryTypes,
  openAiTextLengthOptions,
  openAiTonalities,
} from "../../../../shared/constants/open-ai";
import { toastSuccess } from "../../shared/shared.functions";
import { SearchContext } from "../../context/SearchContext";
import caretIcon from "../../assets/icons/icons-12-x-12-outline-ic-caret.svg";
import uploadIcon from "../../assets/icons/upload_file.svg";
import { useUserState } from "../../hooks/userstate";

interface IOpenAiChatProps {
  searchResultSnapshotId: string;
  queryType: OpenAiQueryTypeEnum;
  fixedQueryType?: boolean;
  handleUnlock: () => void;
  sendToIntegration: (
    sendToIntegrationData: TSendToIntegrationData
  ) => Promise<void>;
  isOpenAiAvailable: boolean;
  isSendToIntAllowed: (queryType: OpenAiQueryTypeEnum) => boolean;
  integrationType?: IntegrationTypesEnum;
}

interface IGeneratedTexts {
  query: TOpenAiQuery;
  initialQueryType: OpenAiQueryTypeEnum;
  queryType: OpenAiQueryTypeEnum;
  queryResponse: string;
}

export interface IOpenAiPresetValues {
  general?: IOpenAiGeneralFormValues;
  locationDescription?: IOpenAiLocDescFormValues;
  query?: IApiOpenAiQuery;
  realEstateDescription?: Omit<IApiOpenAiRealEstDescQuery, "realEstateId">;
}

const OpenAiChat: FC<IOpenAiChatProps> = ({
  searchResultSnapshotId,
  queryType,
  handleUnlock,
  sendToIntegration,
  isOpenAiAvailable,
  isSendToIntAllowed,
  integrationType,
  fixedQueryType,
}) => {
  const { getCurrentUser, upsertCompanyPreset } = useUserState();

  const user = getCurrentUser();

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const {
    searchContextState: { responseConfig },
  } = useContext(SearchContext);

  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);
  const [isEditMode, setIsEditMode] = useState(-1);
  const [isImproveDialogEnabled, setIsImproveDialogEnabled] = useState(false);
  const [queryResponses, setQueryResponse] = useState<IGeneratedTexts[]>([]);

  const generalFormRef = useRef<FormikProps<IOpenAiGeneralFormValues>>(null);
  const locDescFormRef = useRef<FormikProps<IOpenAiLocDescFormValues>>(null);
  const realEstDescFormRef =
    useRef<FormikProps<IApiOpenAiRealEstDescQuery>>(null);
  const formRef = useRef<FormikProps<IApiOpenAiQuery>>(null);
  const queryTypeRef = useRef(queryType);

  const { t } = useTranslation();
  const { fetchOpenAiResponse } = useOpenAi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const saveAsPreset = async () => {
    const values = {} as IOpenAiPresetValues;

    if (
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.FACEBOOK_POST,
        OpenAiQueryTypeEnum.INSTAGRAM_CAPTION,
        OpenAiQueryTypeEnum.MACRO_LOC_DESC,
        OpenAiQueryTypeEnum.MICRO_LOC_DESC,
        OpenAiQueryTypeEnum.DISTRICT_DESC,
      ].includes(queryTypeRef.current as OpenAiQueryTypeEnum)
    ) {
      values.locationDescription = locDescFormRef.current?.values;
    }

    if (
      [
        OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
        OpenAiQueryTypeEnum.FACEBOOK_POST,
        OpenAiQueryTypeEnum.INSTAGRAM_CAPTION,
      ].includes(queryTypeRef.current as OpenAiQueryTypeEnum)
    ) {
      let realEstDescPreset = undefined;

      if (realEstDescFormRef.current?.values) {
        const { realEstateId, ...realEstDescFormData } =
          realEstDescFormRef.current.values;

        realEstDescPreset = realEstDescFormData;
      }

      values.realEstateDescription = realEstDescPreset;
    }

    if (
      [
        OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
        OpenAiQueryTypeEnum.GENERAL_QUESTION,
      ].includes(queryTypeRef.current as OpenAiQueryTypeEnum)
    ) {
      values.query = formRef.current?.values;
    }

    if (
      ![
        OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL,
        OpenAiQueryTypeEnum.GENERAL_QUESTION,
      ].includes(queryTypeRef.current as OpenAiQueryTypeEnum)
    ) {
      values.general = generalFormRef.current?.values;
    }

    await upsertCompanyPreset({
      type: queryTypeRef.current as string as OpenAiQueryTypeEnum,
      values: values as Record<string, unknown>,
    });
  };

  const editInputRef = useRef<null | HTMLTextAreaElement>(null);
  const promptInputRef = useRef<null | HTMLTextAreaElement>(null);

  const addQueryResponse = (queryResponse: IGeneratedTexts) => {
    setQueryResponse([...queryResponses, queryResponse]);
  };

  const refineOpenAiResponse = async () => {
    const queryText = promptInputRef.current?.value!;
    const prevResponse = queryResponses[queryResponses.length - 1];
    const query = {
      originalText: prevResponse.queryResponse,
      customText: queryText,
    };

    const response = await fetchOpenAiResponse(
      OpenAiQueryTypeEnum.IMPROVE_TEXT,
      query
    );

    if (response !== "") {
      addQueryResponse({
        queryResponse: response,
        queryType: OpenAiQueryTypeEnum.IMPROVE_TEXT,
        initialQueryType: prevResponse.initialQueryType,
        query: { ...query, customText: queryText },
      });
    }

    setIsImproveDialogEnabled(true);
    setIsFetchResponse(false);
    promptInputRef.current!.value = "";
  };

  // TODO: confirm translating whole chat
  const renderQuery = (genText: IGeneratedTexts) => {
    if (
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
        OpenAiQueryTypeEnum.FACEBOOK_POST,
        OpenAiQueryTypeEnum.INSTAGRAM_CAPTION,
        OpenAiQueryTypeEnum.MICRO_LOC_DESC,
        OpenAiQueryTypeEnum.MACRO_LOC_DESC,
        OpenAiQueryTypeEnum.DISTRICT_DESC,
      ].includes(genText.queryType)
    ) {
      const queryTitle = openAiQueryTypes.find(
        ({ type }) => type === genText.queryType
      )!!.label;

      return (
        <>
          Generiere eine/n <strong>{queryTitle}</strong> für die Zielgruppe{" "}
          {"targetGroupName" in genText.query && genText.query.targetGroupName}.{" "}
          {"textLength" in genText.query &&
            openAiTextLengthOptions.find(
              (textLength) =>
                "textLength" in genText.query &&
                textLength.value === genText.query.textLength
            )!!.text}{" "}
          {"tonality" in genText.query &&
            "Nutze eine " +
              openAiTonalities[genText.query.tonality!!] +
              " Tonalität."}
          {"customText" in genText.query &&
            genText.query.customText !== "" &&
            " Berücksichtige zudem: " + genText.query.customText}
        </>
      );
    }
    return "customText" in genText.query && genText.query.customText;
  };

  useEffect(() => {
    scrollToBottom();
  }, [queryResponses, isFetchResponse]);

  return (
    <>
      <div className="grid grid-cols-12 gap-2 pb-3">
        <div className="place-self-end">
          <img className="w-8" src={areaButlerLogo} alt="AreaButler" />
        </div>
        <div className="col-span-9">
          <div className="border border-primary bg-primary bg-opacity-5 w-fit rounded p-3">
            {t(IntlKeys.snapshotEditor.dataTab.aiDescription)} <br />
            {t(IntlKeys.snapshotEditor.dataTab.pleaseEnterRequirements)}
          </div>
        </div>
      </div>
      {queryResponses &&
        queryResponses.length > 0 &&
        queryResponses.map((genText, i) => {
          return (
            <Fragment key={`${genText.queryType}-${i}`}>
              {genText.query && (
                <div className="grid grid-cols-12 gap-2 pb-3">
                  <div className="col-start-3 col-span-9 grid">
                    <div className="border border-gray-600 bg-gray-100 rounded p-3 w-fit justify-self-end">
                      {renderQuery(genText)}
                    </div>
                  </div>
                  <div className="self-end">
                    <img className="w-8" src={personIcon} alt="person" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-12 gap-3 pb-3">
                <div className="place-self-end">
                  <img className="w-8" src={areaButlerLogo} alt="AreaButler" />
                </div>
                <div className="col-span-9">
                  <div className="border border-primary bg-primary bg-opacity-5 rounded p-3 pb-7 whitespace-pre-wrap relative">
                    {isEditMode === i ? (
                      <textarea
                        className="w-full bg-transparent h-80 p-2 pb-0"
                        ref={editInputRef}
                        defaultValue={genText.queryResponse}
                      />
                    ) : (
                      <>{genText.queryResponse}</>
                    )}
                    <div className="absolute z-1000 right-0 -bottom-2 -mr-10 flex w-fit">
                      {isEditMode !== i ? (
                        <>
                          <div className="border border-primary rounded flex gap-3 w-fit px-2 p-1 bg-white">
                            <img
                              src={editIcon}
                              className="w-5 h-5 cursor-pointer"
                              alt="Text bearbeiten"
                              title="Text bearbeiten"
                              onClick={() => {
                                setIsEditMode(i);
                              }}
                            />
                            <img
                              src={copyIcon}
                              className="w-5 h-5 cursor-pointer"
                              alt="Text kopieren"
                              title="Text kopieren"
                              onClick={() => {
                                const success = copy(genText.queryResponse);

                                if (success) {
                                  toastSuccess(
                                    t(
                                      IntlKeys.common
                                        .successfullyCopiedToClipboard
                                    )
                                  );
                                }
                              }}
                            />
                            <img
                              src={deleteIcon}
                              className="w-5 h-5 cursor-pointer"
                              alt="Text verwerfen"
                              title={t(
                                IntlKeys.snapshotEditor.dataTab.discardText
                              )}
                              onClick={() => {
                                queryResponses.splice(i, 1);
                                setQueryResponse([...queryResponses]);

                                if (queryResponses.length === 0) {
                                  setIsImproveDialogEnabled(false);
                                }
                              }}
                            />
                          </div>
                          {isSendToIntAllowed(genText.initialQueryType) && (
                            <div
                              className="bg-primary-gradient border border-primary rounded flex gap-1 text-accent-content leading-5 px-2 p-1 ml-1 hover:cursor-pointer text-sm"
                              title={t(IntlKeys.snapshotEditor.dataTab.sendTo, {
                                integrationType:
                                  integrationNames[integrationType!],
                              })}
                              onClick={() => {
                                void sendToIntegration({
                                  exportType: genText.initialQueryType as
                                    | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
                                    | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
                                    | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION
                                    | OpenAiQueryTypeEnum.EQUIPMENT_DESCRIPTION,
                                  text: genText.queryResponse,
                                  language: responseConfig?.language,
                                });
                              }}
                            >
                              <img
                                className="w-5 cursor-pointer stroke-slate-50"
                                src={shareIcon}
                                alt="An Partner senden"
                              />
                              {t(IntlKeys.snapshotEditor.dataTab.sendTo, {
                                integrationType:
                                  integrationNames[integrationType!],
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="border border-primary rounded flex gap-4 w-fit p-1 bg-white">
                          <img
                            src={saveIcon}
                            className="w-5 cursor-pointer"
                            alt="Änderung übernehmen"
                            title={t(
                              IntlKeys.snapshotEditor.dataTab.applyChange
                            )}
                            onClick={() => {
                              if (!editInputRef.current) {
                                return;
                              }

                              queryResponses[i] = {
                                ...queryResponses[i],
                                queryResponse: editInputRef.current?.value,
                              };

                              setIsEditMode(-1);
                            }}
                          />
                          <img
                            src={cancelIcon}
                            className="w-5 cursor-pointer"
                            alt="Änderung verwerfen"
                            title={t(
                              IntlKeys.snapshotEditor.dataTab.discardChange
                            )}
                            onClick={() => {
                              setIsEditMode(-1);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {i === 0 && (
                    <div className="border border-primary bg-primary bg-opacity-5 rounded p-3 mt-2">
                      {t(IntlKeys.snapshotEditor.dataTab.improveDescription)}
                    </div>
                  )}
                </div>
              </div>
            </Fragment>
          );
        })}
      <div className="grid grid-cols-12 gap-2 pb-3">
        <div className="col-start-3 col-span-9">
          <div className="border border-gray-600 rounded p-3">
            {queryResponses &&
            queryResponses.length > 0 &&
            isImproveDialogEnabled ? (
              <textarea
                ref={promptInputRef}
                disabled={isFetchResponse}
                className="w-full p-2"
                placeholder={t(
                  IntlKeys.snapshotEditor.dataTab.improvePlaceholder
                )}
              />
            ) : (
              <OpenAiModule
                realEstDescFormRef={realEstDescFormRef}
                generalFormRef={generalFormRef}
                locDescFormRef={locDescFormRef}
                formRef={formRef}
                initialQueryType={queryType}
                fixedQueryType={fixedQueryType}
                searchResultSnapshotId={searchResultSnapshotId}
                onModuleStatusChange={(isReady): void => {
                  setIsGenerateButtonDisabled(!isReady);
                }}
                onQueryTypeChange={(newQueryType) => {
                  queryTypeRef.current = newQueryType;
                }}
                isFetchResponse={isFetchResponse && !isImproveDialogEnabled}
                onResponseFetched={(responseText, queryType, query): void => {
                  if (responseText !== "") {
                    addQueryResponse({
                      query: query!,
                      queryType: queryType,
                      initialQueryType: queryType,
                      queryResponse: responseText,
                    });

                    setIsImproveDialogEnabled(true);
                  }

                  setIsEditMode(-1);
                  setIsFetchResponse(false);
                }}
              />
            )}
            <div className="flex justify justify-end mt-2 gap-2">
              {queryResponses && queryResponses.length > 0 && (
                <button
                  className="btn btn-base-silver"
                  onClick={() =>
                    setIsImproveDialogEnabled(!isImproveDialogEnabled)
                  }
                  disabled={isGenerateButtonDisabled || isFetchResponse}
                >
                  {isImproveDialogEnabled ? (
                    <>{t(IntlKeys.snapshotEditor.dataTab.enterNewWishes)}</>
                  ) : (
                    <>{t(IntlKeys.snapshotEditor.dataTab.improveLastText)}</>
                  )}
                </button>
              )}
              &nbsp;
              <button
                className={`btn bg-primary-gradient max-w-fit self-end ${
                  isFetchResponse ? "loading" : ""
                }`}
                form="open-ai-location-description-form"
                onClick={() => {
                  if (!isOpenAiAvailable) {
                    handleUnlock();
                    return;
                  }

                  setIsFetchResponse(true);

                  if (isImproveDialogEnabled) {
                    if (promptInputRef.current?.value === "") {
                      return;
                    }

                    void refineOpenAiResponse();
                  }
                }}
                disabled={isGenerateButtonDisabled || isFetchResponse}
              >
                {isOpenAiAvailable
                  ? t(IntlKeys.snapshotEditor.dataTab.generate)
                  : t(IntlKeys.common.unlock)}
              </button>
              {user.isAdmin && !isImproveDialogEnabled && (
                <div className="dropdown dropdown-hover dropdown-top dropdown-end">
                  <button className="btn btn-primary dropdown-btn w-14">
                    <img
                      src={caretIcon}
                      alt="icon-dropdown"
                      className="rotate-180"
                    />
                  </button>
                  <ul
                    className="dropdown-content text-right"
                    style={{ top: "auto", background: "none" }}
                  >
                    <li
                      className="btn btn-primary mb-1 whitespace-nowrap text-left w-max"
                      onClick={saveAsPreset}
                    >
                      <img
                        src={uploadIcon}
                        alt="icon-preset"
                        className="invert h-full mr-2"
                      />
                      {t(IntlKeys.snapshotEditor.dataTab.saveAsPreset)}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="self-end">
          <img className="w-8" src={personIcon} alt="person" />
        </div>
      </div>
      <div ref={messagesEndRef}></div>
    </>
  );
};

export default OpenAiChat;
