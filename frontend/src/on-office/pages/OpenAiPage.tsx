import { FunctionComponent, useContext, useEffect, useState } from "react";

import OpenAiModule from "../../components/open-ai/OpenAiModule";
import { LoadingMessage } from "../OnOfficeContainer";
import {
  SearchContext,
  SearchContextActionTypes,
} from "../../context/SearchContext";
import DefaultLayout from "../../layout/defaultLayout";
import { RequestStatusTypesEnum } from "../../../../shared/types/types";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { ConfigContext } from "../../context/ConfigContext";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { useHttp } from "../../hooks/http";
import { toastError, toastSuccess } from "../../shared/shared.functions";
import { useIntegrationTools } from "../../hooks/integrationtools";

const OpenAiPage: FunctionComponent = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState, searchContextDispatch } =
    useContext(SearchContext);
  const { userDispatch } = useContext(UserContext);

  const { patch } = useHttp();
  const { checkProdContAvailByAction } = useIntegrationTools();

  const [snapshotId, setSnapshotId] = useState<string>();
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isCopyTextButtonDisabled, setIsCopyTextButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);
  const [queryType, setQueryType] = useState<OpenAiQueryTypeEnum>();
  const [queryResponse, setQueryResponse] = useState<string | undefined>();

  const realEstateListing = searchContextState.realEstateListing!;

  useEffect(() => {
    if (searchContextState.integrationSnapshotId) {
      setSnapshotId(searchContextState.integrationSnapshotId);
    }
  }, [searchContextState.integrationSnapshotId]);

  const handleResponseFetched = (
    responseQueryType: OpenAiQueryTypeEnum,
    requestStatus: RequestStatusTypesEnum,
    responseText?: string
  ) => {
    setIsFetchResponse(false);

    if (requestStatus === RequestStatusTypesEnum.FAILURE) {
      if (
        checkProdContAvailByAction(
          responseQueryType,
          !realEstateListing.openAiRequestQuantity
        )
      ) {
        toastError("Fehler beim Senden der KI-Anfrage!");
      }

      return;
    }

    setQueryResponse(responseText);
    setIsCopyTextButtonDisabled(false);
    let openAiRequestQuantity = realEstateListing.openAiRequestQuantity;

    if (!openAiRequestQuantity) {
      openAiRequestQuantity = 100;

      userDispatch({
        type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
        payload: {
          integrationType: integrationType!,
          actionType: responseQueryType,
        },
      });
    }

    searchContextDispatch({
      type: SearchContextActionTypes.SET_REAL_ESTATE_LISTING,
      payload: {
        ...realEstateListing,
        openAiRequestQuantity: openAiRequestQuantity - 1,
      },
    });
  };

  if (!snapshotId) {
    return <LoadingMessage />;
  }

  return (
    <DefaultLayout
      title={`Adresse: ${searchContextState.placesLocation?.label}`}
      withHorizontalPadding={true}
      isOverriddenActionsTop={true}
    >
      <div className="flex flex-col my-5 gap-5">
        <h1 className="text-xl gap-2">KI Texte aus der magischen Feder</h1>
        <div className="text-justify text-base">
          Unser KI-Assistent bietet Inspiration für die Konstruktion von Texten,
          insbesondere bei Schwierigkeiten bei der Struktur und Formulierung. Er
          bezieht Umgebungsdaten unserer Analyse und die Informationen zur
          Immobilie mit ein - dies ist unser USP. Die Abfrage kann bis zu 20
          Sekunden dauern. Mit einem Klick auf "An onOffice senden" wird der
          Text automatisch in das äquivalente Standardfeld in der Immobilie
          eingefügt.
        </div>
        <OpenAiModule
          searchResultSnapshotId={snapshotId}
          onModuleStatusChange={(isReady) => {
            setIsGenerateButtonDisabled(!isReady);
          }}
          isFetchResponse={isFetchResponse}
          onResponseFetched={handleResponseFetched}
          onQueryTypeChange={(changedQueryType) => {
            setIsCopyTextButtonDisabled(true);
            setQueryType(changedQueryType);
          }}
        />
        <div className="flex justify-between">
          <button
            className="btn bg-primary-gradient max-w-fit self-end"
            onClick={() => {
              toastSuccess("Die Daten wurden an onOffice gesendet!");
              setIsCopyTextButtonDisabled(true);

              void patch(
                `/api/on-office/estate/${searchContextState.integrationId}`,
                { queryType, queryResponse }
              );
            }}
            disabled={isCopyTextButtonDisabled}
          >
            An onOffice senden
          </button>
          <button
            className={`btn bg-primary-gradient max-w-fit self-end ${
              isFetchResponse ? "loading" : ""
            }`}
            form={"open-ai-location-description-form"}
            onClick={() => {
              if (
                queryType &&
                checkProdContAvailByAction(
                  queryType,
                  !realEstateListing.openAiRequestQuantity
                )
              ) {
                setIsCopyTextButtonDisabled(true);
                setIsFetchResponse(true);
              }
            }}
            disabled={isGenerateButtonDisabled || isFetchResponse}
          >
            Generieren
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default OpenAiPage;
