import {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import OpenAiModule from "./open-ai/OpenAiModule";
import { OpenAiQueryTypeEnum } from "../../../shared/types/open-ai";
import { useIntegrationTools } from "../hooks/integration/integrationtools";
import copy from "copy-to-clipboard";
import crossIcon from "../assets/icons/cross.svg";
import personIcon from "../assets/icons/person.svg";
import areaButlerLogo from "../assets/icons/areabutler.svg";
import copyIcon from "../assets/icons/copy.svg";
import editIcon from "../assets/icons/edit.svg";
import deleteIcon from "../assets/icons/icons-16-x-16-outline-ic-delete.svg";
import saveIcon from "../assets/icons/check.svg";
import cancelIcon from "../assets/icons/cancel.svg";
import shareIcon from "../assets/icons/share.svg";
import {
  IntegrationActionTypeEnum,
  TUnlockIntProduct,
} from "../../../shared/types/integration";
import { SearchContext } from "../context/SearchContext";
import { ConfigContext } from "../context/ConfigContext";
import { integrationNames } from "../../../shared/constants/integration";

import "./OpenAiModal.scss";
import { TOpenAiQuery, useOpenAi } from "../hooks/openai";

interface IOpenAiModalProps {
  closeModal: () => void;
  searchResultSnapshotId: string;
  queryType: OpenAiQueryTypeEnum;
  performUnlock?: TUnlockIntProduct;
}

interface IGeneratedTexts {
  query: TOpenAiQuery;
  initialQueryType: OpenAiQueryTypeEnum;
  queryType: OpenAiQueryTypeEnum;
  queryResponse: string;
}

const OpenAiModal: FunctionComponent<IOpenAiModalProps> = ({
  closeModal,
  searchResultSnapshotId,
  queryType,
  performUnlock,
}) => {
  const { integrationType } = useContext(ConfigContext);
  const {
    searchContextState: { realEstateListing },
  } = useContext(SearchContext);

  const { sendToIntegration } = useIntegrationTools();

  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);
  const [isEditMode, setIsEditMode] = useState(-1);
  const [isImproveDialogEnabled, setIsImproveDialogEnabled] = useState(false);

  const [queryResponses, setQueryResponse] = useState<IGeneratedTexts[]>([]);

  const { fetchOpenAiResponse } = useOpenAi();
  const isIntegration = !!integrationType;
  const isSendToIntAllowed = (queryType: OpenAiQueryTypeEnum) => {
    return (
      isIntegration &&
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
      ].includes(queryType)
    );
  };

  const isNotIntOrAvailForIntUser =
    !isIntegration || !!realEstateListing?.openAiRequestQuantity;

  const handleUnlock = (): void => {
    if (performUnlock) {
      performUnlock(
        "KI-Texte freischalten?",
        IntegrationActionTypeEnum.UNLOCK_OPEN_AI
      );
    }
  };

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      text:
        "Sei mein Experte für Immobilien. In einer vorherigen Iteration ist folgender Text entstanden ============" +
        prevResponse.queryResponse +
        "============ Der Kunde hat hierzu folgende Änderungswünsche: " +
        queryText,
    };
    const queryType = OpenAiQueryTypeEnum.GENERAL_QUESTION;
    const response = await fetchOpenAiResponse(queryType, query);
    if (response !== "") {
      addQueryResponse({
        queryResponse: response,
        queryType: queryType,
        initialQueryType: prevResponse.initialQueryType,
        query: { ...query, customText: queryText },
      });
    }
    setIsImproveDialogEnabled(true);
    setIsFetchResponse(false);
    promptInputRef.current!.value = "";
  };

  const getQueryTitle = (queryType: OpenAiQueryTypeEnum) => {
    switch (queryType) {
      case OpenAiQueryTypeEnum.LOCATION_DESCRIPTION:
        return "Lagebeschreibung";
      case OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION:
        return "Immobilienbeschreibung";
      case OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION:
        return "Lage- und Immobilienbeschreibung";
      case OpenAiQueryTypeEnum.GENERAL_QUESTION:
        return "Generelle Anfrage";
      case OpenAiQueryTypeEnum.FORMAL_TO_INFORMAL:
        return "Formal zu informell";
    }
  };

  const renderQueryResponse = (genText: IGeneratedTexts) => {
    if (
      [
        OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
        OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
        OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
      ].includes(genText.queryType)
    ) {
      const queryTitle = getQueryTitle(genText.queryType);
      return (
        <>
          Generiere eine <strong>{queryTitle}</strong> für die Zielgruppe{" "}
          <em>
            {"targetGroupName" in genText.query &&
              genText.query.targetGroupName}
          </em>
          .
        </>
      );
    }
    return "customText" in genText.query && genText.query.customText;
  };

  useEffect(() => {
    scrollToBottom();
  }, [queryResponses, isFetchResponse]);

  return (
    <div className="modal modal-open z-2000">
      <div className="modal-box max-h-screen min-w-[75%]">
        <h1 className="text-xl flex items-center gap-2 p-3 border-b">
          KI Texte aus der magischen Feder
          <button
            className="btn btn-sm absolute right-3 top-3"
            onClick={closeModal}
          >
            <img
              src={crossIcon}
              alt="modal-close"
              title="KI Assistenten schließen"
            />
          </button>
        </h1>
        <div className="scrollable-content pt-4 overflow-y-scroll">
          <div className="grid grid-cols-12 gap-2 pb-3">
            <div className="place-self-end">
              <img className="w-8" src={areaButlerLogo} alt="AreaButler" />
            </div>
            <div className="col-span-9">
              <div className="border border-primary bg-primary bg-opacity-5 w-fit rounded p-3">
                Unser KI-Textgenerator bietet Inspiration für die Konstruktion
                von Texten, insbesondere bei Schwierigkeiten bei der Struktur
                und Formulierung. Er bezieht Umgebungsdaten und Informationen
                zur Immobilie mit ein. <br />
                Bitte geben Sie Ihre Wünsche für den zu generierenden Text ein.
              </div>
            </div>
          </div>
          {queryResponses &&
            queryResponses.length > 0 &&
            queryResponses.map((genText, i) => {
              return (
                <>
                  {genText.query && (
                    <div className="grid grid-cols-12 gap-2 pb-3">
                      <div className="col-start-3 col-span-9 grid">
                        <div className="border border-gray-600 bg-gray-100 rounded p-3 w-fit justify-self-end">
                          {renderQueryResponse(genText)}
                        </div>
                      </div>
                      <div className="self-end">
                        <img className="w-8" src={personIcon} alt="person" />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-12 gap-3 pb-3">
                    <div className="place-self-end">
                      <img
                        className="w-8"
                        src={areaButlerLogo}
                        alt="AreaButler"
                      />
                    </div>
                    <div className="col-span-9">
                      <div className="border border-primary bg-primary bg-opacity-5 rounded p-3 pb-7 whitespace-pre-wrap relative">
                        {isEditMode === i ? (
                          <textarea
                            className="w-full bg-transparent h-60 p-2 pb-0"
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
                                    copy(genText.queryResponse);
                                  }}
                                />
                                <img
                                  src={deleteIcon}
                                  className="w-5 h-5 cursor-pointer"
                                  alt="Text verwerfen"
                                  title="Text verwerfen"
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
                                  title={
                                    "An " +
                                    integrationNames[integrationType!] +
                                    " senden"
                                  }
                                  onClick={() => {
                                    sendToIntegration({
                                      exportType: genText.initialQueryType as
                                        | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
                                        | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
                                        | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
                                      text: genText.queryResponse,
                                    });
                                  }}
                                >
                                  <img
                                    className="w-5 cursor-pointer stroke-slate-50"
                                    src={shareIcon}
                                    alt="An Partner senden"
                                  />
                                  An {integrationNames[integrationType!]} senden
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="border border-primary rounded flex gap-4 w-fit p-1 bg-white">
                              <img
                                src={saveIcon}
                                className="w-5 cursor-pointer"
                                alt="Änderung übernehmen"
                                title="Änderung übernehmen"
                                onClick={() => {
                                  if (editInputRef.current) {
                                    queryResponses[i] = {
                                      ...queryResponses[i],
                                      queryResponse:
                                        editInputRef.current?.value,
                                    };
                                    setIsEditMode(-1);
                                  }
                                }}
                              />
                              <img
                                src={cancelIcon}
                                className="w-5 cursor-pointer"
                                alt="Änderung verwerfen"
                                title="Änderung verwerfen"
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
                          Wünschen Sie eine Verbesserung oder Ergänzung des
                          Textes? Hierzu können Sie den Text selber editieren
                          oder uns in dem Eingabefeld unterhalb mitteilen,
                          welche Information wir bei der Generierung eines neuen
                          Textes berücksichtigen sollen.
                        </div>
                      )}
                    </div>
                  </div>
                </>
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
                    placeholder="Ihre Verbesserung oder Ergänzung zum generierten Text..."
                  />
                ) : (
                  <OpenAiModule
                    initialQueryType={queryType}
                    searchResultSnapshotId={searchResultSnapshotId}
                    onModuleStatusChange={(isReady): void => {
                      setIsGenerateButtonDisabled(!isReady);
                    }}
                    isFetchResponse={isFetchResponse && !isImproveDialogEnabled}
                    onResponseFetched={(responseText, query): void => {
                      if (responseText !== "") {
                        addQueryResponse({
                          query: query!,
                          queryType: queryType,
                          initialQueryType: queryType,
                          queryResponse: responseText,
                        });
                      }
                      setIsEditMode(-1);
                      setIsImproveDialogEnabled(true);
                      setIsFetchResponse(false);
                    }}
                  />
                )}
                <div className="flex justify justify-between mt-2">
                  {queryResponses && queryResponses.length > 0 && (
                    <button
                      className="btn btn-base-silver"
                      onClick={() =>
                        setIsImproveDialogEnabled(!isImproveDialogEnabled)
                      }
                      disabled={isGenerateButtonDisabled || isFetchResponse}
                    >
                      {isImproveDialogEnabled ? (
                        <>Neue Wünsche eingeben</>
                      ) : (
                        <>Letzten Text verbessern</>
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
                      if (isNotIntOrAvailForIntUser) {
                        setIsFetchResponse(true);
                        if (isImproveDialogEnabled) {
                          if (promptInputRef.current?.value === "") return;
                          refineOpenAiResponse();
                        }
                        return;
                      }

                      handleUnlock();
                    }}
                    disabled={isGenerateButtonDisabled || isFetchResponse}
                  >
                    {isNotIntOrAvailForIntUser ? "Generieren" : "Freischalten"}
                  </button>
                </div>
              </div>
            </div>
            <div className="self-end">
              <img className="w-8" src={personIcon} alt="person" />
            </div>
          </div>
          <div ref={messagesEndRef}></div>
        </div>
      </div>
    </div>
  );
};

export default OpenAiModal;
