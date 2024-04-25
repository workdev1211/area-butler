import { FunctionComponent, useContext, useState, useEffect, useRef } from "react";

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
import {
  IntegrationTypesEnum,
  TUnlockIntProduct,
} from "../../../shared/types/integration";
import { SearchContext } from "../context/SearchContext";
import { ConfigContext } from "../context/ConfigContext";
import { integrationNames } from "../../../shared/constants/integration";

import "./OpenAiModal.scss";
import { TOpenAiQuery } from "hooks/openai";
import { MeansOfTransportation } from "../../../shared/types/types";

interface IOpenAiModalProps {
  closeModal: () => void;
  searchResultSnapshotId: string;
  queryType: OpenAiQueryTypeEnum;
  performUnlock?: TUnlockIntProduct;
}

interface IGeneratedTexts {
  query?: TOpenAiQuery;
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
  const [isCopyTextButtonDisabled, setIsCopyTextButtonDisabled] =
    useState(true);
  const [queryResponses, setQueryResponse] = useState<IGeneratedTexts[]>([]);

  const isPropstackInt = integrationType === IntegrationTypesEnum.PROPSTACK;

  const isIntegration = !!integrationType;
  const isSendToIntAllowed =
    isIntegration &&
    [
      OpenAiQueryTypeEnum.LOCATION_DESCRIPTION,
      OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION,
      OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
    ].includes(queryType) &&
    queryResponses;

  // TODO PROPSTACK CONTINGENT
  const isNotIntOrAvailForIntUser =
    !isIntegration ||
    !!realEstateListing?.openAiRequestQuantity ||
    isPropstackInt;

  const handleUnlock = (): void => {
    if (performUnlock) {
      performUnlock("KI-Texte freischalten?", queryType);
    }
  };
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const editInputRef = useRef<null | HTMLTextAreaElement>(null)
  const promptInputRef = useRef<null | HTMLTextAreaElement>(null)

  const addQueryResponse = (queryResponse: IGeneratedTexts) => {
    setQueryResponse([...queryResponses, queryResponse]);
  }

  const renderQuery = (query: TOpenAiQuery) => {
    return <></>
  }

  useEffect(() => {
    scrollToBottom()
  }, [queryResponses, isFetchResponse]);

  return (
    <div className="modal modal-open z-2000">
      <div className="modal-box max-h-screen min-w-[75%]">
        <h1 className="text-xl flex items-center gap-2 modal-header">
          KI Texte aus der magischen Feder
          <button className="btn btn-sm absolute right-15 top-15" onClick={closeModal}><img src={crossIcon} alt="modal-close"/></button>
        </h1>
        <div className="scrollable-content">
          <div className="chat-wrapper justify-left">
            <div className="chat-author">
              <img src={areaButlerLogo} alt="AreaButler"/>
            </div>
            <div className="chat-messages">
              <div className="msg msg-primary msg-left">
                Unser KI-Textgenerator bietet Inspiration für die Konstruktion von Texten, insbesondere bei Schwierigkeiten bei der Struktur und Formulierung. Er bezieht Umgebungsdaten und Informationen zur Immobilie mit ein. <br/>
                Bitte geben Sie Ihre Wünsche für den zu generierenden Text ein.
              </div>
            </div>
          </div>
          <div className="chat-wrapper justify-right">
            <div className="chat-messages">
              <div className="msg msg-secondary msg-right">
                <OpenAiModule
                  initialQueryType={queryType}
                  searchResultSnapshotId={searchResultSnapshotId}
                  onModuleStatusChange={(isReady): void => {
                    setIsGenerateButtonDisabled(!isReady);
                  }}
                  isFetchResponse={isFetchResponse}
                  onResponseFetched={(responseText, query): void => {
                    setIsCopyTextButtonDisabled(false);
                    addQueryResponse({
                      queryType: queryType,
                      queryResponse: responseText
                    });
                    setIsEditMode(-1)
                    addQueryResponse({
                      queryType: queryType,
                      query: query,
                      queryResponse: `Willkommen in Ihrem neuen Stadtviertel, ein pulsierender Knotenpunkt der lokalen Kultur und Einrichtungen, der aktiven Bewegung und erholsamen Ruhezeiten. Hier haben Sie alles, was das Leben bereichert, buchstäblich nur einen Steinwurf entfernt. Ob feine Küche oder schnelle Bissen, die umliegenden gastronomischen Einrichtungen wie das gemütliche "Alexandros" (14m) und "Die Pizzeria" (42m) bieten eine Vielzahl an kulinarischen Genüssen. 

  Oder wie wäre es mit einem energiegeladenen Start in den Tag im nahen "Sporteve" Fitnessstudio, gerade mal 140 Meter von Ihrer Haustür entfernt? Und nachdem Training können Sie sich direkt in der "Erika Apotheke Bartz" (148m) um Ihre Gesundheitsbedürfnisse kümmern. Die medizinische Versorgung vor Ort stellt sicher, dass Sie sich nie weit um Hilfe umsehen müssen. Die nahegelegenen Ärzte, Apotheken und anderen medizinischen Einrichtungen bieten Ihnen eine hervorragende Gesundheitsversorgung.

  Mit 3 umliegenden Haltestellen, wie der Schubackstraße nur 109 Meter entfernt, ist größer Mobilität garantiert. Hier, in diesem perfekt angeschlossenen Stadtviertel, sind Sie immer nur wenige Minuten von Ihrem Ziel entfernt.

  Ein Highlight dieser Lage ist der "Literarische Garten", der grüne Anziehungspunkt für Frischluft- und Naturliebhaber, nur einen kurzen Spaziergang (153m) entfernt. Hier können Sie Ihre Gedanken schweifen lassen und sich nach einem aktiven Tag regenerieren. Und für Ihre Kleinen stehen diverse Spielplätzen, wie der nur 162 Meter entfernte Spielplatz, für Spaß und Frühförderung bereit. 

  Egal ob Sie spontan ein paar Zutaten für das Abendessen oder die Wocheneinkäufe besorgen müssen, die umliegenden Supermärkte – unter anderem der nur 240 Meter entfernte "PENNY" – haben alles, was Sie brauchen. Von frischen Nahrungsmitteln bis hin zu Alltagshelfern – alles ist nur wenige Schritte entfernt.

  Darüber hinaus bietet die Nähe zur "Gedenkstätte Ernst Thälmann" (206m) aufschlussreiche Einblicke in die lokale Geschichte und Kultur, und das "Alma Hoppes Lustspielhaus" (478m) sorgt für ein reichhaltiges Angebot an Theater- und Kulturveranstaltungen.

  Für Reisende und globale Abenteurer ist auch der Zugang zu weit fortgeschrittenen Transportnetzen ein Plus. In verkehrsgünstiger Lage zu mehreren Autobahnen und zum internationalen Flughafen, ist diese Adresse ein perfekter Ausgangspunkt für alle Ihre Abenteuer.

  Insbesondere für Immobilieninteressenten, die eine ausgewogene Mischung aus urbanem Leben und ruhigem Rückzugsort suchen, bietet diese Lage alles. Mit der perfekten Balance aus Gesundheitseinrichtungen, Bildungseinrichtungen, kulturellen Hotspots, Natur und Aktivsport - kurz: Sie ist das optimale Zuhause und der ideale Lebensraum für Bewohner jeden Alters!`
  })
                    setIsFetchResponse(false);
                  }}
                />
                <div className="flex justify justify-end mt-2">
                  <button
                    className={`btn bg-primary-gradient max-w-fit self-end ${
                      isFetchResponse ? "loading" : ""
                    }`}
                    form="open-ai-location-description-form"
                    onClick={() => {
                      if (isNotIntOrAvailForIntUser) {
                        setIsFetchResponse(true);
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
            <div className="chat-author"><img src={personIcon} alt="person"/></div>
          </div>
          {(isFetchResponse || (queryResponses && queryResponses.length > 0)) && queryResponses.map((genText, i, {length}) => {
              return (<>
                {i !== 0 && genText.query && (
                  <div className="chat-wrapper justify-right">
                    <div className="chat-messages">
                      <div className="msg msg-secondary msg-right">
                        {genText.query?.snapshotId}
                      </div>
                    </div>
                    <div className="chat-author"><img src={personIcon} alt="person"/></div>
                  </div>
                )}
                  <div className="chat-wrapper justify-left">
                    <div className="chat-author">
                      <img src={areaButlerLogo} alt="AreaButler"/>
                    </div>
                    <div className="chat-messages">
                      <div className="msg msg-primary msg-left generated-text">
                        {isEditMode === i ? 
                          (<textarea className="full-width" ref={editInputRef} defaultValue={genText.queryResponse}/>) 
                          : <>{genText.queryResponse}</>}
                          <div className="msg-tools z-1000">
                            {(isEditMode !== i) ? <>
                              <img src={editIcon} alt="Bearbeiten" onClick={() => {
                                  setIsEditMode(i);
                              }}/>
                              <img src={copyIcon} alt="Kopieren" onClick={() => {
                                  copy(genText.queryResponse);
                                }} />
                              <img src={deleteIcon} alt="Löschen" onClick={() => {
                                  queryResponses.splice(i, 1);
                                  setQueryResponse([...queryResponses]);
                                }} />
                            </> : <>
                              <img src={saveIcon} alt="Speichern" onClick={() => {
                                if (editInputRef.current) {
                                  queryResponses[i] = {...queryResponses[i], queryResponse : editInputRef.current?.value}
                                  setIsEditMode(-1);
                                }
                              }}/>
                              <img src={cancelIcon} alt="Abbrechen" onClick={() => {setIsEditMode(-1)}}/>
                            </>}
                          </div>
                      </div>
                      {i === 0 && (
                        <div className="msg msg-primary msg-left">
                          Wünschen Sie eine Verbesserung oder Ergänzung des Textes? Hierzu können Sie den Text selber editieren oder uns in dem Eingabefeld unterhalb mitteilen, welche Information wir bei der Generierung eines neuen Textes berücksichtigen sollen.
                        </div>
                      )}
                {isFetchResponse && (
                  <div className="msg msg-primary msg-left">
                    Bitte warten, der Text wird generiert...
                  </div>
                )}
              </div>
            </div>
          </>)})}
          <div
            className={`modal-action ${isIntegration ? "justify-between" : ""}`}
          >
            {isSendToIntAllowed && (
              <button
                className="btn bg-primary-gradient max-w-fit self-end"
                onClick={(): void => {
                  setIsCopyTextButtonDisabled(true);

                  void sendToIntegration({
                    exportType: queryType as
                      | OpenAiQueryTypeEnum.LOCATION_DESCRIPTION
                      | OpenAiQueryTypeEnum.REAL_ESTATE_DESCRIPTION
                      | OpenAiQueryTypeEnum.LOCATION_REAL_ESTATE_DESCRIPTION,
                    text: queryResponses[0].queryResponse,
                  });
                }}
                disabled={isCopyTextButtonDisabled}
              >
                An {integrationNames[integrationType]} senden
              </button>
            )}
            {queryResponses && queryResponses.length > 0 && (
              <div className="chat-wrapper justify-right">
                <div className="chat-messages">
                  <div className="msg msg-secondary msg-right flex">
                    <textarea ref={promptInputRef} disabled={isFetchResponse} className="full-width" placeholder="Ihre Verbesserung oder Ergänzung des Textes..." />
                    <button
                      className={`btn bg-primary-gradient max-w-fit self-end ${
                        isFetchResponse ? "loading" : ""
                      }`}
                      onClick={() => {
                        if (promptInputRef.current?.value === "") 
                          return;
                        queryResponses[queryResponses.length-1] = {...queryResponses[queryResponses.length-1], query: {
                          customText : promptInputRef.current?.value,
                          meanOfTransportation: MeansOfTransportation.WALK,
                          realEstateId: realEstateListing?.id!!,
                          realEstateType: realEstateListing?.type!!,
                          snapshotId: searchResultSnapshotId,
                          text: promptInputRef.current?.value
                        }}
                        setQueryResponse(queryResponses);
                        setIsFetchResponse(true);
                      }}
                      disabled={isGenerateButtonDisabled || isFetchResponse}
                    >
                      {isNotIntOrAvailForIntUser ? "Generieren" : "Freischalten"}
                    </button>
                  </div>
                </div>
                <div className="chat-author"><img src={personIcon} alt="person"/></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenAiModal;
