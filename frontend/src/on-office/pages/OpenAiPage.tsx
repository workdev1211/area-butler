import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import OpenAiModule from "../../components/open-ai/OpenAiModule";
import { LoadingMessage } from "../OnOfficeContainer";
import { SearchContext } from "../../context/SearchContext";
import DefaultLayout from "../../layout/defaultLayout";
import { RequestStatusTypesEnum } from "../../../../shared/types/types";
import { UserActionTypes, UserContext } from "../../context/UserContext";
import { checkProdContAvailability } from "../../shared/integration.functions";
import { ConfigContext } from "../../context/ConfigContext";
import { OpenAiQueryTypeEnum } from "../../../../shared/types/open-ai";
import { useHttp } from "../../hooks/http";
import { toastSuccess } from "../../shared/shared.functions";

const OpenAiPage: FunctionComponent = () => {
  const { integrationType } = useContext(ConfigContext);
  const { searchContextState } = useContext(SearchContext);
  const {
    userState: { integrationUser },
    userDispatch,
  } = useContext(UserContext);

  const history = useHistory();
  const { post } = useHttp();

  const [snapshotId, setSnapshotId] = useState<string>();
  const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] =
    useState(true);
  const [isCopyTextButtonDisabled, setIsCopyTextButtonDisabled] =
    useState(true);
  const [isFetchResponse, setIsFetchResponse] = useState(false);
  const [queryType, setQueryType] = useState<OpenAiQueryTypeEnum>();
  const [queryResponse, setQueryResponse] = useState<string | undefined>();

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
        !checkProdContAvailability(
          integrationType!,
          responseQueryType,
          integrationUser!.availProdContingents
        )
      ) {
        history.push("/products");
      }

      return;
    }

    setQueryResponse(responseText);
    setIsCopyTextButtonDisabled(false);

    userDispatch({
      type: UserActionTypes.INT_USER_DECR_AVAIL_PROD_CONT,
      payload: {
        integrationType: integrationType!,
        actionType: responseQueryType,
      },
    });
  };

  if (!snapshotId) {
    return <LoadingMessage />;
  }

  return (
    <DefaultLayout
      title={`Adresse: ${searchContextState.placesLocation.label}`}
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

              void post(
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
              setIsCopyTextButtonDisabled(true);
              setIsFetchResponse(true);
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
